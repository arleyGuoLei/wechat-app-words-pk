import config from './../../utils/config'

App.Page({
  data: {},
  async onLoad () {
  },
  onShareAppMessage () {
    return config.defaultShare
  }
})
