import { ICombatRoute } from 'miniprogram/utils/routes'
import { Combat, COMBAT_TYPE } from './../../../typings/model'
import { formatWordList, formatCombatInfo, formatCombatUser } from './../../utils/helper'
import config from './../../utils/config'
import wordModel from './../../models/word'
import combatModel from './../../models/combat'
import userModel from './../../models/user'
import { store, IAppOption, events } from './../../app'
import watcherChange from './watcherChange'
import { loading, toast } from './../../utils/util'
const app = getApp<IAppOption>()

App.Page({
  data: {
    debug: false,
    isShareResult: false, // 是否为战绩分享，如果是的话，直接展示的为结算页
    isShareSuccess: false // 是否已经分享过，一局只增加一次分享赠送的提示卡
  },
  combatWatcher: { close: async () => {} },

  async onLoad (query) {
    await app.$loginAsync
    const options: ICombatRoute = query as unknown as ICombatRoute

    if (options.id && options.share_result === 'true') {
      loading.show('获取战绩中 ...')
      this.setData({ isShareResult: true })
      await this.initCombatWatcher(options.id)
      loading.hide()
      return
    }

    // NOTE: 数据库层面创建房间，然后创建该房间的监听及房间数据通过云端首次 watch 初始化
    if (options.state === 'create' && options.type === 'friend') {
      const combatId = await this.createCombat('friend')

      await this.initCombatWatcher(combatId)

      // NOTE: 该房间是通过「再来一局」创建的情况下，会携带该参数
      options.previousId && combatModel.updateNext(options.previousId, combatId)
      return
    }

    // NOTE: 分享给好友的链接进入后的状态，通过 watch 来获取房间的云端数据
    if (options.state === 'ready' && options.type === 'friend' && options.id) {
      loading.show('获取房间信息中')
      await this.initCombatWatcher(options.id)
      loading.hide()
      return
    }

    if (options.type === 'random') {
      const startRandom = await this.randomCombat()
      if (!startRandom) {
        void this.closeCombatWatcher()
        toast.show('随机匹配失败，请稍后重试', 2000).finally(() => {
          this.onBack()
        })
      }
      return
    }

    // NOTE: 调试对局 'start' || 'end' ，用户侧不存在该分支
    if (options.id && options.debug === 'true') {
      this.data.debug = true
      loading.show('获取房间信息中')
      await this.initCombatWatcher(options.id)
      loading.hide()
      return
    }

    void app.routes.pages.home.redirectTo({})
  },

  async onUnload () {
    this.selectComponent('#pkScene')?.playBgm(false)

    await this.closeCombatWatcher()

    if (!store.$state.combat) { return }

    const { isOwner, state, _id, type } = store.$state.combat

    // 好友对战 不是房主，用户已经准备 => 取消准备
    if (!isOwner && state === 'ready' && type === 'friend') {
      await combatModel.exit(_id)
    }

    // 好友对战 是房主，用户已经准备 => 转让房间给已经准备的用户
    if (isOwner && state === 'ready' && type === 'friend') {
      await combatModel.transfer(_id)
    }

    if (state === 'start') {
      await combatModel.dismiss(_id)
    }

    // 1. 随机匹配创建好但是没有用户加入的房间，退出时将房间置为 precreate 状态，禁止再有用户加入
    // 因为可能存在本地还是 precreate 而远程已经为 create 的情况，所以也同样做一样的处理
    // 2. 好友对战房间，邀请好友加入对战，但是好友还没准备，自己先退出房间了，也得弃用该房间
    if (isOwner && ['precreate', 'create'].includes(state)) {
      await combatModel.create2Pre(_id, type)
    }
  },

  async createCombat (combatType: COMBAT_TYPE): Promise<DB.DocumentId> {
    const userinfo = store.$state.user // 避免再次要求用户授权用户信息，所以直接从 state 中获取

    // NOTE: 1. 获取随机单词，获取的长度为「每道题目选项数」 * 「用户每局对战题目的数目」，因为每道题目只有一个选项是正确的，所以需要获取「选项数倍数」的单词
    const words = await wordModel.getRandomWords(userinfo.bookId, config.combatOptionNumber * userinfo.config.combatQuestionNumber)

    // NOTE: 2. 格式化单词数据
    const wordList = formatWordList(words, config.combatOptionNumber)

    // NOTE: 3. 数据库中新增房间数据
    const book = store.getState().book
    const combatInfo = formatCombatInfo(userinfo, book, combatType, wordList)
    const combat = await combatModel.create(combatInfo)

    store.setState({ combat: { ...combat, isOwner: true } })

    return combat._id
  },

  async randomCombat (): Promise<boolean> {
    // NOTE: 开发阶段直接打开随机匹配页面的，需要强制设置 type 为 random，显示匹配组件
    store.setState({ combat: { ...store.$state.combat!, type: 'random' } })
    const user = store.$state.user
    const id = await combatModel.lock(formatCombatUser(user), user.bookId)

    if (id) {
      console.log('锁定随机匹配房间：', id)

      await this.initCombatWatcher(id)

      const isJoin = await combatModel.ready(id, formatCombatUser(user), 'random')
      if (isJoin) {
        console.log('随机匹配房间准备成功')
        // NOTE: 开始倒计时，如果一定时间内对战还没开始，则再一次进行随机匹配
        setTimeout(async () => {
          if (store.$state.combat?.state === 'ready') {
            await this.closeCombatWatcher()
            await this.randomCombat()
          }
        }, config.randomReadyWaiting)
        return true
      }
    }

    const combatId = await this.createCombat('random')
    await this.initCombatWatcher(combatId)
    const isCreate = await combatModel.pre2Create(combatId)

    if (isCreate) {
      console.log('随机匹配房间创建成功')
      // NOTE: 开始计时，如果一定时间内还没匹配到用户，就开始一局人机对战

      setTimeout(async () => {
        if (store.$state.combat?.state === 'create') {
          events.emit('startNPCCombat')
        }
      }, config.combatRandomMaxTime)
      return true
    }
    return false
  },

  /**
   * 初次 watch 监听返回的房间云端信息，房主在创建房间后监听并返回，非房主在进入准备页面时就通过 watch 来获取房间信息
   * @param combat 对战房间信息
   */
  initCombatInfo (combat: Combat) {
    const { users, state, type } = combat ?? {}

    let message = '房间状态异常'
    switch (state) {
      case 'dismiss':
      case 'end':
        message = '对战已结束'
        break
      case 'start':
        message = '对战已开始'
        break
      case 'precreate': // await combatModel.create2Pre(_id, type)
        message = '房间已解散'
        break
      default:
        if (users?.length >= 2 && users.every(user => user._openid !== store.$state.user._openid)) { // 房间是否已经满了 && 当前这个用户没有加入这个房间
          message = '对战房间已满'
        }
    }

    console.log('initCombatInfo state =>', state)
    // NOTE: initCombatInfo 时机下值为 create(好友对战) 或
    // 随机匹配 (precreate、lock) 的才是正常的房间
    // 当前分享战绩的房间
    if ((['precreate', 'lock'].includes(state) && type !== 'friend') ||
    (state === 'create' && type === 'friend') ||
    this.data.debug ||
    this.data.isShareResult) {
      store.setState({
        combat: {
          ...combat,
          state: this.data.isShareResult ? 'end' : state,
          isOwner: store.$state.user._openid === users[0]?._openid, // 是否为房主
          wordsIndex: 0 // 当前对战所到的题目序号
        }
      })
    } else {
      void this.closeCombatWatcher()
      toast.show(message, 2000).finally(() => {
        this.onBack()
      })
    }
  },

  async initCombatWatcher (id: DB.DocumentId) {
    // @ts-expect-error
    this.combatWatcher = await combatModel.watch(id, watcherChange.bind(this), (e) => {
      void this.closeCombatWatcher()
      toast.show('服务器连接超时，请重试', 1200).finally(() => {
        this.onBack()
      })
    })
  },

  async closeCombatWatcher (retry = true) {
    try { await this.combatWatcher?.close() } catch (error) {
      retry && this.closeCombatWatcher(false)
    }
  },

  onShareAppMessage ({ from }) {
    const { _id, book, state, wordList, users, isOwner } = store.getState().combat ?? {}

    if (from === 'button' && state === 'create' && _id && book) {
      return {
        title: `❤ @你, 来一起pk「${book.name}」吖，点我进入`,
        path: `/pages/combat/combat?id=${String(_id)}&type=friend&state=ready`,
        imageUrl: './../../images/share-pk-bg.png'
      }
    }

    if (from === 'button' && state === 'end' && _id && book) {
      if (!this.data.isShareSuccess) {
        void userModel.addTotalTip(config.combatShareAddTotalTip)
        store.setState({
          user: {
            ...store.$state.user,
            totalTip: store.$state.user.totalTip + config.combatShareAddTotalTip
          }
        })
      }

      this.data.isShareSuccess = true
      const user = isOwner ? users![0] : users![1]
      const anotherUser = isOwner ? users![1] : users![0]

      const correctRate = Math.ceil(Object.keys(user.records).filter((key) => user.records[key].score !== config.combatWrongDeduction).length / wordList!.length * 100)

      return {
        title: `我在和${anotherUser.nickname}的「${book.name}」对战获 ${correctRate}% 的正确率，点我查看详情`,
        path: `/pages/combat/combat?id=${String(_id)}&share_result=true`,
        imageUrl: './../../images/share-default-bg.png'
      }
    }

    return config.defaultShare
  },

  onBack () {
    if (getCurrentPages().length === 1) {
      void app.routes.pages.home.redirectTo({})
    } else {
      void app.router.navigateBack({ delta: 1 })
    }
  },

  onBgmChange (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {action: 'start' | 'pause'} >) {
    const { action = 'start' } = event.currentTarget.dataset
    const play = action === 'start'

    const user = store.getState().user
    user.config.backgroundMusic = play
    store.setState({ user })

    this.selectComponent('#pkScene').playBgm(play)

    void userModel.updateConfig('backgroundMusic', play)
  }

})
