import { ICombatRoute } from 'miniprogram/utils/routes'
import { COMBAT_TYPE } from './../../../typings/model'
import { formatWordList, getUserInfo, formatCombatInfo } from './../../utils/helper'
import config from './../../utils/config'
import wordModel from './../../models/word'
import CombatModel from './../../models/combat'
import { store, IAppOption } from './../../app'

const app = getApp<IAppOption>()

App.Page({
  async onLoad (query) {
    await app.$loginAsync
    const options: ICombatRoute = query as unknown as ICombatRoute

    if (options.state === 'create' && options.type === 'friend') {
      void this.createCombat('friend')
      return
    }

    // NOTE: 分享给好友的链接进入后的状态
    if (options.state === 'ready' && options.type === 'friend' && options.id) {
      void this.getCombatInfo('friend')
      return
    }

    void app.routes.pages.home.redirectTo({})
  },
  async createCombat (combatType: COMBAT_TYPE) {
    const userinfo = await getUserInfo()

    // NOTE: 1. 获取随机单词，获取的长度为「每道题目选项数」 * 「用户每局对战题目的数目」，因为每道题目只有一个选项是正确的，所以需要获取「选项数倍数」的单词
    const words = await wordModel.getRandomWords(userinfo.bookId, config.combatOptionNumber * userinfo.config.combatQuestionNumber)

    // NOTE: 2. 格式化单词数据
    const wordList = formatWordList(words, config.combatOptionNumber)

    // NOTE: 3. 数据库中新增房间数据
    const book = store.getState().book
    const combatInfo = formatCombatInfo(userinfo, book, combatType, wordList)
    const combat = await CombatModel.create(combatInfo)

    store.setState({ combat })
  },

  async getCombatInfo (combatType: COMBAT_TYPE) {
    // 获取房间信息
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
