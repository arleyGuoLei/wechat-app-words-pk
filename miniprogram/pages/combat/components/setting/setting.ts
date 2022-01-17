import { store } from './../../../../app'
import userModel from './../../../../models/user'

App.Component({
  methods: {
    onSwitchChange (e: WechatMiniprogram.SwitchChange<WechatMiniprogram.IAnyObject, {name: 'backgroundMusic' | 'pronounce' | 'vibrate'} >) {
      const { target: { dataset: { name } }, detail: { value } } = e
      // NOTE: 更新数据库的用户配置
      void userModel.updateConfig(name, value)

      const user = store.getState().user
      user.config[name] = value
      store.setState({ user })
    }
  }
})
