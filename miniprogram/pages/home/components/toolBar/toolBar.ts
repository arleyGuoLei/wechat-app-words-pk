
App.Component({
  methods: {
    onSelectBook () {
      const page = getCurrentPages()
      const bookSelect = (page[page.length - 1]?.selectComponent('#book-select'))
      bookSelect?.show()
    },
    onTipCard () {}
  }
})
