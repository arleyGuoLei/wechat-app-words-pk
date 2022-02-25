import { Combat } from './../../../../../typings/model'
import { store, events } from './../../../../app'
import { getUserInfo, formatCombatInfo } from './../../../../utils/helper'
import config from './../../../../utils/config'
import { throttle } from './../../../../utils/util'

App.Component({
  options: {
    addGlobalClass: true
  },
  data: {
    matching: true
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
      const combatInfo = formatCombatInfo(userinfo, book, 'random', new Array(+userinfo.config.combatQuestionNumber).fill({}))

      store.setState({
        combat: { ...combatInfo, state: 'create', next: '', _id: '', _createTime: '', isOwner: true }
      })
    },
    startCombat (doc: Combat) {
      this.setData({ matching: false })
      void wx.vibrateLong()

      const now = Date.now()
      const startTime = new Date(doc.startTime as string).getTime()
      const expectStartTime = startTime + config.randomStartWaiting
      const timeout = expectStartTime - now > 0 ? expectStartTime - now : 0

      console.log('对战预期开始时间：', expectStartTime)
      console.log('对战开始延迟时间：', timeout)

      setTimeout(() => {
        wx.nextTick(() => { store.setState({ combat: { ...store.$state.combat!, state: 'start' } }) })
      }, timeout)
    },
    onStartNPCCombat: throttle(function () {
      events.emit('startNPCCombat')
    }, 800)
  }
})
