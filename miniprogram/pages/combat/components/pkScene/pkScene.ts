import combatModel from './../../../../models/combat'
import userWordModel from './../../../../models/userWord'
import userModel from './../../../../models/user'
import { store, events } from './../../../../app'
import { throttle, playAudio, sleep, playPronunciation } from './../../../../utils/util'
import { getCombatSelectScore } from './../../../../utils/helper'
import config from './../../../../utils/config'

type SelectEvent = WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {index: number, useTip?: boolean} >

const TIMER_NULL = -1

/** 倒计时的计时器，每秒执行一次 */
let countdownTimer = TIMER_NULL

/** 对战连接异常检测 */
let detectCombatTimer = TIMER_NULL

/** 每题的倒计时开始时间，用于选择时做分数计算 */
let countDownStartTime = 0

let bgm = wx.createInnerAudioContext({ useWebAudioImplement: true })

App.Component({
  data: {
    selectIndex: -1,
    optionsAnimation: {},
    countdownAnimation: {}
  },
  options: {
    addGlobalClass: true
  },
  lifetimes: {
    ready () {
      // NOTE: 第一题的选项展示不需要动画
      this.initBgm()
      this.clearStateInit(false)
    },
    detached () {
      this.playBgm(false)
      bgm?.destroy()
      clearInterval(countdownTimer)
    }
  },
  methods: {
    clearStateInit (playAnimation = true) {
      playAnimation && this.playOptionsAnimation()
      playAnimation && this.playCountdownAnimation('refresh')

      store.setState({
        combat: {
          ...store.$state.combat!,
          canSelect: true,
          countdown: config.combatCountDown
        }
      })

      clearInterval(countdownTimer) // NOTE: 不继续本题的倒计时了

      // 清空选择结果，避免选项答案闪烁
      this.setData({ selectIndex: -1 })

      // 延迟等待选项动画接近完成，再开始倒计时
      wx.nextTick(async () => {
        await sleep(300)

        // NOTE: 播放单词发音 sleep(300) > watcher 中的 sleep(200)，wordIndex 已经 + 1
        this.playPronunciation()

        this.countdown()

        events.emit('autoNPCSelect')
      })
    },
    onSelectOption: throttle(async function (event: SelectEvent) {
      let score = config.combatWrongDeduction
      const { currentTarget: { dataset: { index: selectIndex, useTip = false } } } = event

      const id = store.$state.combat?._id as DB.DocumentId
      const wordsIndex = store.$state.combat?.wordsIndex!
      const wordList = store.$state.combat?.wordList!
      const userIndex = store.$state.combat?.isOwner ? 0 : 1
      const canSelect = store.$state.combat?.canSelect
      const correctIndex = wordList[wordsIndex].correctIndex

      if (!canSelect) {
        void wx.showToast({
          title: '此题已选, 点击太快了哦',
          icon: 'none',
          duration: 1000
        })
        return
      }

      // NOTE: 选择之后则上锁，防止网络请求过程中再次选择
      store.setState({ combat: { ...store.$state.combat!, canSelect: false } })
      // @ts-expect-error
      this.setData({ selectIndex })

      if (selectIndex === correctIndex) { // 选择正确
        playAudio(config.audios.selectCorrect)

        // NOTE: 本地提示卡数目 - 1
        useTip && store.setState({ user: { ...store.$state.user, totalTip: store.$state.user.totalTip - 1 } })
        // NOTE: 使用提示卡答题的都加入到生词本
        useTip && userWordModel.add(wordList[wordsIndex].wordId)

        // @ts-expect-error
        score = this.getScore()
      } else {
        void userWordModel.add(wordList[wordsIndex].wordId)

        playAudio(config.audios.selectWrong)

        store.$state.user.config.vibrate && wx.vibrateShort({ type: 'light' })
      }

      const isSelect = await combatModel.selectOption(id, selectIndex, score, wordsIndex, userIndex)
      if (isSelect) {
        // 选择成功

        // NOTE: 选择成功，如果是使用提示卡的，数据库中提示卡数目 - 1
        useTip && userModel.addTotalTip(-1)

        // NOTE: 人机对战模式下，当前用户选择后，就进行人机选择，避免用户等待
        store.$state.combat?.type === 'npc' && setTimeout(() => events.emit('npcSelect'), config.NPCSelectDelay)
      } else {
        // @ts-expect-error
        this.setData({ selectIndex: -1 })
        store.setState({ combat: { ...store.$state.combat!, canSelect: true } })
        void wx.showToast({ title: '答题失败，请重试', icon: 'none', duration: 900 })

        // NOTE: 选择失败的情况下，恢复被 - 1的提示卡
        useTip && store.setState({ user: { ...store.$state.user, totalTip: store.$state.user.totalTip + 1 } })
      }
    }, 1000),

    onGetTip: throttle(async function (this: {onSelectOption: (event: SelectEvent) => Promise<void>}) {
      const totalTip = store.$state.user.totalTip
      if (totalTip <= 0) {
        void wx.showToast({ title: '没有提示卡了哦', icon: 'none', duration: 800 })
        return
      }

      const wordsIndex = store.$state.combat?.wordsIndex!

      void this.onSelectOption({
        // @ts-expect-error
        currentTarget: {
          dataset: {
            index: store.$state.combat?.wordList[wordsIndex].correctIndex!,
            useTip: true
          }
        }
      })
    }, 500),

    getScore () {
      // 每道题满分 100 分，选择越快分数越高
      // score = -10 * (x) + 100
      return getCombatSelectScore(countDownStartTime)
    },

    playOptionsAnimation () {
      const animate = wx.createAnimation({ duration: 550, timingFunction: 'ease-in-out' })
      animate.scaleX(0.1).opacity(0.1).step()
      animate.scaleX(1).opacity(1).step()
      this.setData({ optionsAnimation: animate.export() })
    },

    /**
     * 播放倒计时动画
     * @param type 动画类型，last 为 最后 3 秒放大缩小动画提示，refresh 为重新一轮倒计时渐隐渐显
     */
    playCountdownAnimation (type: 'last' | 'refresh' = 'last') {
      if (type === 'last') {
        const animate = wx.createAnimation({ duration: 500, timingFunction: 'ease-in-out' })
        animate.scale(1.2).step()
        animate.scale(1).step()
        this.setData({ countdownAnimation: animate.export() })
      } else {
        const animate = wx.createAnimation({ duration: 550, timingFunction: 'ease-in-out' })
        animate.scaleX(0.1).opacity(0.1).step()
        animate.scaleX(1).opacity(1).step()
        this.setData({ countdownAnimation: animate.export() })
      }
    },

    countdown () {
      // NOTE: 存储本题开始时间，用于计算分数
      countDownStartTime = Date.now()
      clearInterval(countdownTimer)

      clearInterval(detectCombatTimer)

      countdownTimer = setInterval(() => {
        const combat = store.getState().combat!
        const countdownTime = combat.countdown!

        if (countdownTime === 1) {
          if (combat.canSelect) {
            const e = { currentTarget: { dataset: { index: -1 } } }
            this.onSelectOption(e)
          }
          this.detectCombat()
          clearInterval(countdownTimer)
        }

        if (countdownTime > 1 && countdownTime <= 4) {
          // 最后 1 ~ 3 秒播放动画
          this.playCountdownAnimation()
        }

        store.setState({ combat: { ...store.$state.combat!, countdown: countdownTime - 1 } })
      }, 1000)
    },

    /** 倒计时结束后检测房间状态是否正常，如果在 combatSelectTimeout 内没进入下一轮倒计时，则判断为房间异常 */
    detectCombat () {
      detectCombatTimer = setTimeout(async () => {
        const { state, _id } = store.$state.combat!
        if (state === 'start') {
          console.log('题目切换超时')
          await combatModel.dismiss(_id)
        }
      }, config.combatSelectTimeout)
    },

    playPronunciation () {
      // NOTE: 播放当前单词的发音， wordIndex 在 watcherChange 切换题目时自增
      const wordList = store.$state.combat?.wordList!
      const wordsIndex = store.$state.combat?.wordsIndex!
      store.$state.user.config.pronounce && playPronunciation(wordList[wordsIndex].word)
    },

    initBgm () {
      bgm = wx.createInnerAudioContext({ useWebAudioImplement: true })
      bgm.loop = true
      bgm.autoplay = false
      bgm.src = store.$state.appConfig.backgroundMusicUrl
      // NOTE: 延迟一会儿再播放，偶现不延迟直接播放没有声音
      setTimeout(() => { this.playBgm() }, 800)
    },

    playBgm (play = true) {
      wx.nextTick(() => {
        play && store.$state.user.config.backgroundMusic && bgm?.play()

        !play && bgm?.pause()
      })
    }
  }
})
