import { ICombatRoute } from 'miniprogram/utils/routes'
import { Combat, COMBAT_TYPE } from './../../../typings/model'
import { formatWordList, getUserInfo, formatCombatInfo } from './../../utils/helper'
import config from './../../utils/config'
import wordModel from './../../models/word'
import combatModel from './../../models/combat'
import { store, IAppOption } from './../../app'
import watcherChange from './watcherChange'
import { loading } from './../../utils/util'
const app = getApp<IAppOption>()

App.Page({
  combatWatcher: { close: async () => {} },

  async onLoad (query) {
    await app.$loginAsync
    const options: ICombatRoute = query as unknown as ICombatRoute

    // NOTE: 数据库层面创建房间，然后创建该房间的监听及房间数据通过云端首次 watch 初始化
    if (options.state === 'create' && options.type === 'friend') {
      const combatId = await this.createCombat('friend')
      await this.initCombatWatcher(combatId)
      return
    }

    // NOTE: 分享给好友的链接进入后的状态，通过 watch 来获取房间的云端数据
    if (options.state === 'ready' && options.type === 'friend' && options.id) {
      loading.show('获取房间信息中')
      await this.initCombatWatcher(options.id)
      loading.hide()
      return
    }

    void app.routes.pages.home.redirectTo({})
  },

  async createCombat (combatType: COMBAT_TYPE): Promise<DB.DocumentId> {
    const userinfo = await getUserInfo()

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

  /**
   * 初次 watch 监听返回的房间云端信息，房主在创建房间后监听并返回，非房主在进入准备页面时就通过 watch 来获取房间信息
   * @param combat 对战房间信息
   */
  initCombatInfo (combat: Combat) {
    const { users, state } = combat ?? {}

    let message = '房间状态异常'
    switch (state) {
      case 'dismiss':
      case 'end':
        message = '对战已结束'
        break
      case 'start':
        message = '对战已开始'
        break
      default:
        if (users?.length >= 2) { // 房间是否已经满了
          message = '对战房间已满'
        }
    }

    // NOTE: initCombatInfo 时机只有值为 create 的才是正常的房间
    if (state === 'create') {
      store.setState({
        combat: {
          ...combat,
          isOwner: store.$state.user._openid === users[0]?._openid // 是否为房主
        }
      })
    } else {
      void this.closeCombatWatcher()
      console.log(message) // TODO: 弹窗
      this.onBack()
    }
  },

  async initCombatWatcher (id: DB.DocumentId) {
    this.combatWatcher = await combatModel.watch(id, watcherChange.bind(this), () => {})
  },

  async closeCombatWatcher (retry = true) {
    try { await this.combatWatcher?.close() } catch (error) {
      retry && this.closeCombatWatcher(false)
    }
  },

  onShareAppMessage ({ from }) {
    const { _id, book, state } = store.getState().combat ?? {}

    if (from === 'button' && state === 'create' && _id && book) {
      return {
        title: `❤ @你, 来一起pk「${book.name}」吖，点我进入`,
        path: `/pages/combat/combat?id=${String(_id)}&type=friend&state=ready`,
        imageUrl: './../../images/share-pk-bg.png'
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
  }

})