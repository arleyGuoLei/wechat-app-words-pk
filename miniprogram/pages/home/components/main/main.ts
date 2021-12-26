import { COMBAT_TYPE } from './../../../../../typings/model'
import { formatWordList, getUserInfo, formatCombatInfo } from './../../../../utils/helper'
import { throttle, loading } from './../../../../utils/util'
import config from './../../../../utils/config'
import wordModel from './../../../../models/word'
import CombatModel from './../../../../models/combat'
import { IAppOption, store } from './../../../../app'

const app = getApp<IAppOption>()

App.Component({
  options: {
    /** 页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面 */
    /** 为了使用 app.wxss 中定义的一些全局样式，比如：.shadow-lg 和 动画库 */
    addGlobalClass: true
  },
  methods: {
    async createCombat (combatType: COMBAT_TYPE) {
      const userinfo = await getUserInfo()

      loading.show('生成题目中...')

      // NOTE: 1. 获取随机单词，获取的长度为「每道题目选项数」 * 「用户每局对战题目的数目」，因为每道题目只有一个选项是正确的，所以需要获取「选项数倍数」的单词
      const words = await wordModel.getRandomWords(userinfo.bookId, config.combatOptionNumber * userinfo.config.combatQuestionNumber)

      // NOTE: 2. 格式化单词数据
      const wordList = formatWordList(words, config.combatOptionNumber)

      loading.show('正在创建房间...')

      // NOTE: 3. 数据库中新增房间数据
      const book = store.getState().book
      const combatInfo = formatCombatInfo(userinfo, book, combatType, wordList)
      const combat = await CombatModel.create(combatInfo)

      store.setState({ combat })
      loading.hide()
    },

    /**
     * 随机匹配
     */
    onRandomMatch: throttle(async function (this: {createCombat: (combatType: COMBAT_TYPE) => Promise<void>}) {
      void app.routes.pages.combat.go({})
    }, 500),

    /**
     * 好友对战
     */
    onChallengeFriend: throttle(function (this: {createCombat: (combatType: COMBAT_TYPE) => Promise<void>}) {
      void this.createCombat('friend')
    }, 500),

    /**
     * 词汇挑战
     */
    onChallengeWord () {

    },

    /**
     * 生词本
     */
    onToUserWords () {

    }
  }
})
