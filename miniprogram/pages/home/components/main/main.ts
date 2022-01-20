import { COMBAT_TYPE } from './../../../../../typings/model'
import { getUserInfo, formatCombatInfo } from './../../../../utils/helper'
import { throttle } from './../../../../utils/util'
import { IAppOption, store } from './../../../../app'

const app = getApp<IAppOption>()

App.Component({
  options: {
    /** 页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面 */
    /** 为了使用 app.wxss 中定义的一些全局样式，比如：.shadow-lg 和 动画库 */
    addGlobalClass: true
  },
  methods: {
    /**
     * 随机匹配
     */
    onRandomMatch: throttle(async function (this: {createCombat: (combatType: COMBAT_TYPE) => Promise<void>}) {
      const userinfo = await getUserInfo()
      const book = store.getState().book
      const combatInfo = formatCombatInfo(userinfo, book, 'random', new Array(userinfo.config.combatQuestionNumber).fill({}))

      // NOTE: 先用本地数据生成对战信息，用于展示「好友邀请」页面所需信息
      store.setState({
        combat: { ...combatInfo, state: 'create', next: '', _id: '', _createTime: '', isOwner: true }
      })

      void app.routes.pages.combat.go({ type: 'random' })
    }, 500),

    /**
     * 好友对战
     */
    onChallengeFriend: throttle(async function (this: {createCombat: (combatType: COMBAT_TYPE) => Promise<void>}) {
      const userinfo = await getUserInfo()
      const book = store.getState().book
      const combatInfo = formatCombatInfo(userinfo, book, 'friend', new Array(userinfo.config.combatQuestionNumber).fill({}))

      // NOTE: 先用本地数据生成对战信息，用于展示「好友邀请」页面所需信息
      store.setState({
        combat: { ...combatInfo, state: 'create', next: '', _id: '', _createTime: '', isOwner: true }
      })

      void app.routes.pages.combat.go({ type: 'friend', state: 'create' })
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
