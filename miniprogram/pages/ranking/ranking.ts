
import { IAppOption } from './../../app'
import userModel from './../../models/user'
import { loading } from './../../utils/util'
import { IRankingType, IExperienceRanking, ILearningRanking } from './../../../typings/data'

const app = getApp<IAppOption>()

interface PageData {
  type: IRankingType
  rankingList: IExperienceRanking['list'] | ILearningRanking['list']
  mine: IExperienceRanking['mine']| ILearningRanking['mine'] | null
}

interface PageInstance {
  getData: () => Promise<void>
  changeType: (event: WechatMiniprogram.CustomEvent<{type: IRankingType }>) => void
}

App.Page<PageData, PageInstance>({
  data: {
    type: 'experience',
    rankingList: [],
    mine: null
  },
  onLoad () {
    void this.getData()
  },
  async getData () {
    loading.show()
    const data = await userModel.getRanking(this.data.type)
    loading.hide()

    if (!data) {
      void wx.showToast({ title: '排行榜加载失败，请稍后重试', icon: 'none', duration: 2000 })
      return
    }

    this.setData({ rankingList: data.list, mine: data.mine })
  },
  changeType ({ detail: { type } }) {
    if (type !== this.data.type) {
      this.setData({
        type
      }, () => {
        void this.getData()
      })
    }
  }
})
