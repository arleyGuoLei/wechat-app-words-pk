import userWordModel from './../../models/userWord'
import { IUserWords } from './../../../typings/model'

interface PageData {
  wordsList: IUserWords['list']
  nextPage: IUserWords['nextPage']
}

interface PageInstance {
  getData: () => Promise<void>
}

App.Page<PageData, PageInstance>({
  data: {
    wordsList: [],
    nextPage: 1
  },
  onLoad () {
    void this.getData()
  },
  async getData () {
    const page = this.data.nextPage
    if (page) {
      const myDate = await userWordModel.getMyList(page)
      if (!myDate) {
        console.log('获取生词失败，请重试')
        void wx.showToast({ title: '获取生词失败，请稍后重试', icon: 'none', duration: 2000 })
        return
      }
      const { nextPage, list } = myDate

      this.setData({ wordsList: this.data.wordsList.concat(list), nextPage })
    }
  },
  onReachBottom () {

  }
})
