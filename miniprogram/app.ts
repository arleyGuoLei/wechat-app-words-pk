import config from './utils/config'
import Store from 'wxministore'
import userModel, { User } from './models/user'
import state, { State } from './utils/state'

export const store = new Store<State>({
  state,
  pageListener: {}
})

type $loginAsync = Promise<User>

export interface IAppOption {
  store: Store<State>
  $loginAsync?: $loginAsync
  initEnv: () => Promise<void>
  initUiGlobal: () => void
  login: () => $loginAsync
}

App<IAppOption>({
  store,
  async onLaunch () {
    this.initUiGlobal()

    // 初始化云开发，赋值 cloudEnv 才可进行云开发操作
    await this.initEnv()

    this.$loginAsync = this.login()
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

  async initEnv () {
    return await new Promise((resolve) => {
      const envVersion = __wxConfig.envVersion

      // 开发环境 (develop)：编辑器环境
      // 正式环境 (release)：小程序体验版 和 正式版
      const env = envVersion === 'develop' ? config.cloudEnv.develop : config.cloudEnv.release
      wx.cloud.init({ env, traceUser: true })

      store.setState({ cloudEnv: env }, resolve)
    })
  },

  async login (): Promise<User> {
    const user = await userModel.login()
    await new Promise(resolve => store.setState({ user }, resolve))
    return user
  }
})
