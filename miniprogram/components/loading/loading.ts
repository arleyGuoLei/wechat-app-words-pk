App.Component({
  options: {
    addGlobalClass: true
  },
  data: {
    show: false,
    loadingText: '加载中'
  },
  methods: {
    show (loadingText?: string) {
      this.setData({ loadingText: loadingText ?? this.data.loadingText, show: true })
    },
    hide () {
      this.setData({ show: false })
    }
  }
})
