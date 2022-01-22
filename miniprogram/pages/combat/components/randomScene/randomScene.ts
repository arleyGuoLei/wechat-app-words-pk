import { store } from './../../../../app'
import { getUserInfo, formatCombatInfo } from './../../../../utils/helper'

App.Component({
  options: {
    addGlobalClass: true
  },
  lifetimes: {
    attached () {
      const page = getCurrentPages()
      if (page.length === 1) { void this.debugInitPage() }
    }
  },
  methods: {
    /** 开发阶段直接通过设置编译模式进入随机匹配页面的，做一次本地数据初始化 */
    async debugInitPage () {
      const userinfo = await getUserInfo()
      const book = store.getState().book
      const combatInfo = formatCombatInfo(userinfo, book, 'random', new Array(userinfo.config.combatQuestionNumber).fill({}))

      store.setState({
        combat: { ...combatInfo, state: 'create', next: '', _id: '', _createTime: '', isOwner: true }
      })
    }
  }
})
