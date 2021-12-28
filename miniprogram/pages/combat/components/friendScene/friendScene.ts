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
    }
  }
})
