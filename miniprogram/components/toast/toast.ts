App.Component({
  options: {
    multipleSlots: true
  },
  data: {
    show: false,
    /** 提示文案，有则显示 */
    messageText: '',
    /** 是否显示关闭按钮 */
    showClose: true,
    /** 弹窗宽度 */
    width: 500
  },
  methods: {
    hide () { this.setData({ show: false, messageText: '', showClose: true }) },

    /**
     * 打开弹窗，如果有自动关闭在关闭时进行 resolve，如果没有自动关闭，在打开弹窗时 resolve
     * @param text 弹窗文案
     * @param duration 自动关闭时间，如果为 0 则不自动关闭
     * @param width 弹窗宽度
     */
    async show (text = '', duration = 0, width = 500) {
      return await new Promise(resolve => {
        this.setData({ show: true, messageText: text, width })

        if (duration !== 0) {
          this.setData({ showClose: false })
          setTimeout(() => {
            this.hide()
            resolve('auto close')
          }, duration)
        } else {
          resolve('show')
        }
      })
    }
  }
})
