import config from './../../utils/config'
import userModel from './../../models/user'
import userWordModel from './../../models/userWord'
import { store, IAppOption } from './../../app'
import { getUserInfo } from './../../utils/helper'

const app = getApp<IAppOption>()

App.Page({
  onSelect (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {type: 'combatQuestionNumber' | 'backgroundMusic' | 'pronounce' | 'vibrate'} >) {
    const { type } = event.currentTarget.dataset

    const itemList = type === 'combatQuestionNumber' ? config.combatQuestionNumbers.map(n => String(n)) : ['开启', '关闭']

    wx.showActionSheet({
      itemList,
      success (res) {
        const user = store.getState().user
        let value: boolean | string = false

        switch (type) {
          case 'backgroundMusic':
          case 'pronounce':
          case 'vibrate':
            value = res.tapIndex === 0
            user.config[type] = value
            break
          case 'combatQuestionNumber':
            value = String(config.combatQuestionNumbers[res.tapIndex])
            user.config[type] = +value
            break
        }

        void userModel.updateConfig(type, value)
        store.setState({ user })
      }
    })
  },
  onClearUserWords () {
    wx.showModal({
      title: '提示',
      content: '是否确定清空所有生词? 不可恢复',
      confirmText: '清空',
      confirmColor: '#E95F56',
      async success (res) {
        if (res.confirm) {
          const isSuccess = await userWordModel.deleteAll()
          if (isSuccess) {
            void wx.showToast({
              title: '清空成功',
              icon: 'none',
              duration: 2000
            })
          } else {
            void wx.showToast({
              title: '清空失败，请稍后重试',
              icon: 'none',
              duration: 2000
            })
          }
        }
      }
    })
  },
  onUpdateUserInfo () {
    void getUserInfo(true)
  },
  onChat () {
    void wx.setClipboardData({ data: store.$state.appConfig.wechat })
  },
  onAbout () {
    void app.routes.pages.about.go({})
  }
})
