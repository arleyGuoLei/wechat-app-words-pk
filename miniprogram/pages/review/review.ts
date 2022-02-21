import userWordModel from './../../models/userWord'
import { IUserWords } from './../../../typings/data'
import { loading } from './../../utils/util'

interface PageData {
  wordsList: IUserWords['list']
  nextPage: IUserWords['nextPage']
}

interface PageInstance {
  getData: () => Promise<void>
  onDeleteWord: (event: WechatMiniprogram.CustomEvent<{index: number, _id: string}>) => void
}

App.Page<PageData, PageInstance>({
  data: {
    wordsList: [],
    nextPage: 1
  },
  onLoad () {
    wx.nextTick(() => { // loading 组件可能还没挂载，延迟下一个 tick 再做数据请求
      void this.getData()
    })
  },
  async getData () {
    const page = this.data.nextPage
    if (page) {
      loading.show()
      const myDate = await userWordModel.getMyList(page)
      if (!myDate) {
        this.setData({ wordsList: [], nextPage: null })
        console.log('获取生词失败，请重试')
        void wx.showToast({ title: '获取生词失败，请稍后重试', icon: 'none', duration: 2000 })
        return
      }
      const { nextPage, list } = myDate
      this.setData({ wordsList: this.data.wordsList.concat(list), nextPage })
      loading.hide()
    }
  },
  async onReachBottom () {
    await this.getData()
  },
  onDeleteWord ({ detail: { index } }) {
    // NOTE: 在列表中删除词汇，服务端的删除在组件中已经执行
    const { data: { wordsList } } = this
    wordsList.splice(index, 1)
    this.setData({ wordsList })
  }
})
