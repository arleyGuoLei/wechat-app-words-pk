import { store } from './../../../../app'
import combatModel from './../../../../models/combat'
import { getUserInfo, formatCombatUser } from './../../../../utils/helper'
import { loading, toast } from './../../../../utils/util'

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
        // 房间满了，或者房间已经被弃用 (precreate)
        void toast.show('房间可能满了哦 ~')
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
        void toast.show('对战开始失败，好友可能已经退出房间，请重试。如果还是不行请重建房间')
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
        // NOTE: 轻交互重试类的弹窗使用微信自带的提示
        void wx.showToast({
          title: '退出失败，请重试 ...',
          icon: 'none',
          duration: 1200
        })
      }
    }
  }
})
