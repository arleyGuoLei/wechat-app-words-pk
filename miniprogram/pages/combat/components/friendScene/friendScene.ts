import { store } from './../../../../app'
import combatModel from './../../../../models/combat'
import { getUserInfo, formatCombatUser } from './../../../../utils/helper'
import { loading } from './../../../../utils/util'

App.Component({
  options: {
    addGlobalClass: true
  },
  methods: {
    /**
     * 避免房间数据还没加载完，就点击「邀请好友」，防手速党 ...
     */
    onShare (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {share: boolean} >) {
      if (!event.currentTarget.dataset.share) {
        void wx.showToast({
          title: '数据加载中，请稍等 ...',
          icon: 'none',
          duration: 2000
        })
      }
    },

    /**
     * 准备 (好友对战加入房间)
     */
    async onReady () {
      loading.show('加入中')
      const combat = store.$state.combat
      const user = await getUserInfo()
      const isJoin = await combatModel.ready(combat!._id, formatCombatUser(user), 'friend')
      loading.hide()
      if (!isJoin) {
        // TODO: 加入失败，房间已满提示
      }
    },

    /**
     * 房主开始对战
     */
    async onStart () {
      loading.show('开始中')
      const combat = store.$state.combat
      const isStart = await combatModel.start(combat!._id, 'friend')
      loading.hide()
      if (!isStart) {
        // TODO: 开始对战异常
      }
    },

    /**
     * 玩家准备后选择退出对战
     */
    async onExit () {
      loading.show('退出中')
      const combat = store.$state.combat
      const isExit = await combatModel.exit(combat!._id)
      loading.hide()
      if (!isExit) {
        // TODO: 退出房间异常
      }
    }
  }
})
