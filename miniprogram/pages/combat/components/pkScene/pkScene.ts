import combatModel from './../../../../models/combat'
import { store } from './../../../../app'
import { throttle, playAudio, sleep, playPronunciation } from './../../../../utils/util'
import config from './../../../../utils/config'

type SelectEvent = WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {index: number, useTip?: boolean} >

const COUNT_DOWN_NULL = -1

const BGM_URL = 'cloud://cloud1-2gxt3f0qb7420723.636c-cloud1-2gxt3f0qb7420723-1306236996/5c8a08dc4956424741.mp3'
let bgm = wx.createInnerAudioContext()

App.Component({
  data: {
    selectIndex: -1,
    optionsAnimation: {},
    countdownAnimation: {},

    /** 倒计时的计时器，每秒执行一次 */
    countdownTimer: COUNT_DOWN_NULL,

    /** 每题的倒计时开始时间，用于选择时做分数计算 */
    countDownStartTime: 0
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
      clearInterval(this.data.countdownTimer)
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

      clearInterval(this.data.countdownTimer) // NOTE: 不继续本题的倒计时了

      // 延迟等待选项动画接近完成，再开始倒计时
      wx.nextTick(async () => {
        await sleep(300)

        // NOTE: 播放单词发音 sleep(300) > watcher 中的 sleep(200)，wordIndex 已经 + 1
        this.playPronunciation()

        this.countdown()
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

        // @ts-expect-error
        score = this.getScore()
      } else {
        playAudio(config.audios.selectWrong)

        store.$state.user.config.vibrate && wx.vibrateShort({ type: 'light' })

        // TODO: 生词本加入错误单词
      }

      const isSelect = await combatModel.selectOption(id, selectIndex, score, wordsIndex, userIndex)
      if (isSelect) {
        // 选择成功
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
      const totalMilliSecond = config.combatCountDown * 1000
      const timeConsuming = Date.now() - this.data.countDownStartTime // 答题耗时

      const score = Math.ceil(-10 * (timeConsuming / (totalMilliSecond / 10)) + 100)

      if (score >= 100) { return 100 }
      if (score <= 1) { return 1 }
      return score
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
      this.data.countDownStartTime = Date.now()
      clearInterval(this.data.countdownTimer)

      this.data.countdownTimer = setInterval(() => {
        const combat = store.getState().combat!
        const countdownTime = combat.countdown!

        if (countdownTime === 1) {
          if (combat.canSelect) {
            const e = { currentTarget: { dataset: { index: -1 } } }
            this.onSelectOption(e)
          }
          clearInterval(this.data.countdownTimer)
        }

        if (countdownTime > 1 && countdownTime <= 4) {
          // 最后 1 ~ 3 秒播放动画
          this.playCountdownAnimation()
        }

        store.setState({ combat: { ...store.$state.combat!, countdown: countdownTime - 1 } })
      }, 1000)
    },

    playPronunciation () {
      // NOTE: 播放当前单词的发音， wordIndex 在 watcherChange 切换题目时自增
      const wordList = store.$state.combat?.wordList!
      const wordsIndex = store.$state.combat?.wordsIndex!
      store.$state.user.config.pronounce && playPronunciation(wordList[wordsIndex].word)
    },

    initBgm () {
      bgm = wx.createInnerAudioContext()
      bgm.loop = true
      bgm.autoplay = false
      bgm.src = BGM_URL
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
