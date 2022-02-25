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
      const combatInfo = formatCombatInfo(userinfo, book, 'random', new Array(+userinfo.config.combatQuestionNumber).fill({}))

      // NOTE: 先用本地数据生成对战信息，用于展示「好友邀请」页面所需信息
      // NOTE: 该处的 state 应该为 precreate 或 create 更加合理，但是如果为这两个值，小程序数据变了，小程序的 UI 却不会变 ... 小程序框架有 BUG，
      store.setState({
        combat: { ...combatInfo, state: 'lock', next: '', _id: '', _createTime: '', isOwner: true }
      })

      void app.routes.pages.combat.go({ type: 'random' })
    }, 500),

    /**
     * 好友对战
     */
    onChallengeFriend: throttle(async function (this: {createCombat: (combatType: COMBAT_TYPE) => Promise<void>}) {
      const userinfo = await getUserInfo()
      const book = store.getState().book

      const combatInfo = formatCombatInfo(userinfo, book, 'friend', new Array(+userinfo.config.combatQuestionNumber).fill({}))

      // NOTE: 先用本地数据生成对战信息，用于展示「好友邀请」页面所需信息
      store.setState({
        combat: { ...combatInfo, state: 'create', next: '', _id: '', _createTime: '', isOwner: true }
      })

      void app.routes.pages.combat.go({ type: 'friend', state: 'create' })
    }, 500),

    /**
     * 每日词汇
     */
    async onChallengeWord () {
      await getUserInfo()
      void app.routes.pages.learning.go({})
    },

    /**
     * 生词本
     */
    onToUserWords () {
      void app.routes.pages.review.go({})
    }
  }
})
