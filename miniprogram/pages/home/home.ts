App.Page({
  data: {},
  async onLoad () {
    await wx.cloud.callFunction({
      name: 'server',
      data: {

      }
    })
  }
})
