import bookModel from './../../../../models/book'
import { Book } from './../../../../../typings/model'
import { loading } from './../../../../utils/util'
import { store } from './../../../../app'

App.Component({
  options: {
    addGlobalClass: true
  },
  data: {
    bookList: [] as Book[],
    show: false,
    page: 1,
    total: -1,
    loading: false
  },
  methods: {
    onChangeBook (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {index: number} >) {
      const { currentTarget: { dataset: { index } } } = event
      const { data: { bookList } } = this
      const book = bookList[index]
      store.setState({ book })
      this.hide()
    },
    hide () {
      this.setData({ show: false })
    },
    async show () {
      await this.getData(this.data.page)
      this.setData({ show: true })
    },
    async onReachBottom () {
      await this.getData(this.data.page)
    },
    async getTotal () {
      if (this.data.total === -1) {
        const total = await bookModel.getTotal()
        return total
      }
      return this.data.total
    },
    async getData (page: number): Promise<void> {
      if (page === 1) {
        loading.show()
        const [books, total] = await Promise.all([bookModel.getList(page), await this.getTotal()])
        this.setData({ bookList: books, total, page: this.data.page + 1 })
        loading.hide()
      } else {
        let { data: { bookList } } = this

        // 获取总共有多少单词书，除了第一页，都是从本地缓存获取
        const total = await this.getTotal()

        if (this.data.loading) { return } // 避免多次下滑引起重复加载
        this.data.loading = true
        if (bookList.length < total) {
          const books = await bookModel.getList(page)
          bookList = bookList.concat(books)
          this.setData({ bookList, page: this.data.page + 1 })
          this.data.loading = false
        }
      }
    },
    /** 更新单词书的选择人数 */
    updateSelectModel () {
      // TODO: 云函数实现更新，小程序端不应该有更新权限
    }
  }
})
