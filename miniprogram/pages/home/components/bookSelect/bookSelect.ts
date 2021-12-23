import bookModel from './../../../../models/book'
import userModel from './../../../../models/user'
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
      const oldBook = store.getState().book
      const book = bookList[index]

      this.hide()

      // 相当于没切换所选书籍，则不做任何数据处理
      if (oldBook._id === book._id) {
        return
      }

      this.updateSelectModel(book, oldBook)
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
    updateSelectModel (newBook: Book, oldBook: Book) {
      const { data: { bookList } } = this

      // 乐观更新，不关心服务端成功与否
      void userModel.changeSelectBook(newBook._id, oldBook._id)

      this.setData({
        bookList: bookList.map(book => {
          // 老的单词书选择人数 - 1
          if (book._id === oldBook._id && book.peopleNumber > 0) {
            return {
              ...book,
              peopleNumber: book.peopleNumber - 1
            }
          }

          // 新的单词书选择人数 + 1
          if (book._id === newBook._id) {
            return {
              ...book,
              peopleNumber: book.peopleNumber + 1
            }
          }

          return book
        })
      })

      store.setState({
        book: newBook,
        user: {
          ...store.getState().user,
          bookId: newBook._id
        }
      })
    }
  }
})
