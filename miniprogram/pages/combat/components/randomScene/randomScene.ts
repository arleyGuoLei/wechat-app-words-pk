import { Combat } from './../../../../../typings/model'
import { store } from './../../../../app'
import { getUserInfo, formatCombatInfo, formatCombatUser } from './../../../../utils/helper'
import { loading } from './../../../../utils/util'
import config from './../../../../utils/config'
import KvModel from './../../../../models/kv'
import combatModel from './../../../../models/combat'

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
      const combatInfo = formatCombatInfo(userinfo, book, 'random', new Array(userinfo.config.combatQuestionNumber).fill({}))

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
    async onStartNPCCombat () {
      const fail = (title: string): void => {
        loading.hide()
        void wx.showToast({ title, icon: 'none', duration: 1200 })
      }
      const { state, _id } = store.$state.combat!
      if (state !== 'create') {
        void wx.showToast({ title: '数据加载中 ...', icon: 'none', duration: 900 })
        return
      }
      loading.show('召唤人机中 ...')
      const npc = await this.getOneNpc()

      if (!npc) {
        return fail('人机数据获取失败, 请重试')
      }

      const isJoin = await combatModel.ready(_id, formatCombatUser({
        ...npc,
        experience: 0,
        totalGames: 0,
        winGames: 0
      }), 'npc')

      if (!isJoin) {
        return fail('人机对战开始失败，请重试')
      }

      loading.hide()
    },
    async getOneNpc () {
      const npcData = await KvModel.getData('npc')
      if (npcData) {
        // NOTE: 随机取所有人机数据中的一个
        const index = Math.floor(Math.random() * npcData.length)
        return npcData[index]
      }

      return null
    }
  }
})
