import { store, events, IAppOption } from './../../../../app'
import userModel from './../../../../models/user'
const app = getApp<IAppOption>()

interface IMoreHealthPoint {
  /** 按钮文案 */
  button: string

  /** 按钮图标 */
  icon?: string

  /** 底部提示文字 */
  message: string

  /** 按钮点击执行 */
  action: {
    /** open-type 形式调用、函数调用  */
    type: 'open-type' | 'function'
    value: 'share' | 'video' | 'again'
  }
}

const defaultMoreHealthPoint: IMoreHealthPoint[] = [
  {
    button: '继续',
    icon: './../../../../images/word-share.png',
    message: '还有一次机会，分享到群可继续分数',
    action: {
      type: 'open-type',
      value: 'share'
    }
  },
  // TODO: 视频广告接入
  // {
  //   button: '继续',
  //   icon: './../../../../images/word-video-ad.png',
  //   message: '最后一次机会，浏览 15s 视频即可继续',
  //   action: {
  //     type: 'function',
  //     value: 'video'
  //   }
  // },
  {
    button: '再来一局',
    message: '很不错了哦，继续学习，再接再厉',
    action: {
      type: 'function',
      value: 'again'
    }
  }
]

let moreHealthPoint: IMoreHealthPoint[] = []

App.Component({
  options: {
    addGlobalClass: true
  },
  lifetimes: {
    ready () {
      moreHealthPoint = [...defaultMoreHealthPoint] // 每次进入每日词汇重置机会 (浅拷贝)
      events.on('showLearningPopup', this.show.bind(this))
    },
    detached () {
      events.off('showLearningPopup')
    }
  },
  data: {
    show: false,
    content: null as unknown as IMoreHealthPoint,
    rank: ''
  },
  methods: {
    hide () { this.setData({ show: false, rank: '' }) },
    async show (show: boolean) {
      if (!show) {
        this.hide()
        return
      }

      const score = store.$state.learning?.score ?? 0
      let rank = ''

      if (score !== 0) {
        rank = String(await userModel.getLearingScoreRank(score))
      } else {
        rank = '未上榜'
      }

      if (moreHealthPoint.length > 0) {
        const content = moreHealthPoint.length === 1 ? moreHealthPoint[0] : moreHealthPoint.shift() // 除了最后一个再来一局，其他每展现一次即 pop 一次

        this.setData({ show: true, content, rank })
      }
    },
    onNext (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {action: IMoreHealthPoint['action']['value']} >) {
      const { action } = event.currentTarget.dataset

      switch (action) {
        case 'video':
          // TODO: 视频广告
          break
        case 'again':
          void app.routes.pages.learning.redirectTo({})
          break
      }
    },
    onToHome () {
      if (getCurrentPages().length === 1) {
        void app.routes.pages.home.redirectTo({})
      } else {
        void app.router.navigateBack({ delta: 1 })
      }
    }
  }
})
