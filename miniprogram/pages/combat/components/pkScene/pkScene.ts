import combatModel from './../../../../models/combat'
import { store } from './../../../../app'
import { throttle } from './../../../../utils/util'

type SelectEvent = WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {index: number, useTip?: boolean} >

App.Component({
  data: {
    selectIndex: -1,
    optionsAnimation: {}
  },
  options: {
    addGlobalClass: true
  },
  lifetimes: {
    attached () {

    },
    detached () {
    }
  },
  methods: {
    onSelectOption: throttle(async function (event: SelectEvent) {
      const { currentTarget: { dataset: { index: selectIndex, useTip = false } } } = event

      const id = store.$state.combat?._id as DB.DocumentId
      const wordsIndex = store.$state.combat?.wordsIndex!
      const userIndex = store.$state.combat?.isOwner ? 0 : 1
      const canSelect = store.$state.combat?.canSelect

      if (!canSelect) {
        void wx.showToast({
          title: '此题已选, 点击太快了哦',
          icon: 'none',
          duration: 1000
        })
        return
      }

      // NOTE: 选择之后则上锁，防止网络请求过程中再次选择
      store.setState({ combat: { ...store.$state.combat!, canSelect: false } })
      // @ts-expect-error
      this.setData({ selectIndex })

      // NOTE: 本地提示卡数目 - 1
      useTip && store.setState({ user: { ...store.$state.user, totalTip: store.$state.user.totalTip - 1 } })

      const isSelect = await combatModel.selectOption(id, selectIndex, 1, wordsIndex, userIndex)
      if (isSelect) {
        // 选择成功
      } else {
        // @ts-expect-error
        this.setData({ selectIndex: -1 })
        store.setState({ combat: { ...store.$state.combat!, canSelect: true } })
        void wx.showToast({ title: '答题失败，请重试', icon: 'none', duration: 900 })

        // NOTE: 选择失败的情况下，恢复被 - 1的提示卡
        useTip && store.setState({ user: { ...store.$state.user, totalTip: store.$state.user.totalTip + 1 } })
      }
    }, 1000),

    onGetTip: throttle(async function (this: {onSelectOption: (event: SelectEvent) => Promise<void>}) {
      const totalTip = store.$state.user.totalTip
      if (totalTip <= 0) {
        void wx.showToast({ title: '没有提示卡了哦', icon: 'none', duration: 800 })
        return
      }

      const wordsIndex = store.$state.combat?.wordsIndex!

      void this.onSelectOption({
        // @ts-expect-error
        currentTarget: {
          dataset: {
            index: store.$state.combat?.wordList[wordsIndex].correctIndex!,
            useTip: true
          }
        }
      })
    }, 500),

    playOptionsAnimation () {
      // TODO: 动画会卡住
      const animate = wx.createAnimation({ duration: 500, timingFunction: 'ease-in-out' })
      animate.scaleX(0.1).opacity(0.1).step()
      animate.scaleX(1).opacity(1).step()
      this.setData({ optionsAnimation: animate.export() })
    }
  }
})
