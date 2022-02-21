
import userModel from './../../models/user'
import { loading } from './../../utils/util'
import { IRankingType, IExperienceRanking, ILearningRanking } from './../../../typings/data'

interface PageData {
  type: IRankingType
  rankingList: IExperienceRanking['list'] | ILearningRanking['list']
  mine: IExperienceRanking['mine']| ILearningRanking['mine'] | null
}

interface PageInstance {
  getData: (type?: IRankingType) => Promise<void>
  changeType: (event: WechatMiniprogram.CustomEvent<{type: IRankingType }>) => void
}

App.Page<PageData, PageInstance>({
  data: {
    type: 'experience',
    rankingList: [],
    mine: null
  },
  onLoad () {
    wx.nextTick(() => { // loading 组件可能还没挂载，延迟下一个 tick 再做数据请求
      void this.getData()
    })
  },
  async getData (type) {
    loading.show()
    const data = await userModel.getRanking(type ?? this.data.type)
    loading.hide()

    if (!data) {
      void wx.showToast({ title: '排行榜加载失败，请稍后重试', icon: 'none', duration: 2000 })
      return
    }

    this.setData({ rankingList: data.list, mine: data.mine, type: type ?? this.data.type })
  },
  changeType ({ detail: { type } }) {
    if (type !== this.data.type) {
      void this.getData(type)
    }
  }
})
