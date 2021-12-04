import config from './utils/config'
import Store from 'wxministore'

import state, { State } from './utils/state'

export const store = new Store<State>({ state })

export interface IAppOption {
  store: Store<State>
  initEnv: () => void
  initUiGlobal: () => void
}

App<IAppOption>({
  store,
  onLaunch () {
    this.initUiGlobal()
    this.initEnv()
  },

  initUiGlobal () {
    const { statusBarHeight, screenHeight, windowWidth } = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()

    // 计算胶囊按钮的高度，作为头部内容区高度
    const CustomBarHeight = capsule.bottom + capsule.top - statusBarHeight

    store.setState({
      ui: {
        statusBarHeight,
        screenHeight,
        windowWidth,
        CustomBarHeight
      }
    })
  },

  initEnv () {
    const envVersion = __wxConfig.envVersion

    // 开发环境 (develop)：编辑器环境
    // 正式环境 (release)：小程序体验版 和 正式版
    const env = envVersion === 'develop' ? config.cloudEnv.develop : config.cloudEnv.release
    wx.cloud.init({ env, traceUser: true })
    store.setState({ cloudEnv: env })
  }
})
