import { toast } from './../../../../utils/util'

App.Component({
  methods: {
    onSelectBook () {
      const page = getCurrentPages()
      const bookSelect = (page[page.length - 1]?.selectComponent('#book-select'))
      bookSelect?.show()
    },
    onTipCard () {
      void toast.show('可用于「对战模式」和「每日词汇」助力选择', 0, 640)
    }
  }
})
