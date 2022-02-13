import { throttle, playAudio, sleep } from './../../../../utils/util'
import { LearningWord } from './../../../../utils/state'
import config from './../../../../utils/config'
import { store } from './../../../../app'
import userWordModel from './../../../../models/userWord'
import userModel from './../../../../models/user'

type SelectEvent = WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {index: number, useTip?: boolean} >

interface IProblem {
  properties: {
    wordItem: LearningWord
  }
  clearStateInit: () => void
  triggerEvent: WechatMiniprogram.Component.InstanceMethods<{}>['triggerEvent']
}

enum OptionIndex {
  notSelect = -2, // 未选择
  wrongSelect = -1 // 选择错误
}

App.Component({
  data: {
    selectIndex: OptionIndex.notSelect,
    optionsAnimation: {}
  },
  options: {
    addGlobalClass: true
  },
  properties: {
    wordItem: {
      type: Object,
      value: {}
    }
  },
  lifetimes: {
    ready () {
      // NOTE: 第一题的选项展示不需要动画
      this.clearStateInit(false)
    },
    detached () {
    }
  },
  methods: {
    onSelectOption: throttle(async function (this: IProblem, event: SelectEvent) {
      const { currentTarget: { dataset: { index: selectIndex, useTip = false } } } = event

      const { correctIndex, wordId } = this.properties.wordItem

      // @ts-expect-error
      this.setData({ selectIndex })

      // TODO: 得分、错误、生命值处理

      if (selectIndex === correctIndex) {
        playAudio(config.audios.selectCorrect)

        if (useTip) {
          // NOTE: 本地提示卡数目 - 1
          store.setState({ user: { ...store.$state.user, totalTip: store.$state.user.totalTip - 1 } })

          // NOTE: 使用提示卡答题的都加入到生词本
          void userWordModel.add(wordId)

          // NOTE: 选择成功，如果是使用提示卡的，数据库中提示卡数目 - 1
          void userModel.addTotalTip(-1)
        }
      } else {
        void userWordModel.add(wordId)

        playAudio(config.audios.selectWrong)

        store.$state.user.config.vibrate && wx.vibrateShort({ type: 'light' })
      }

      // NOTE: 当本地题目接近最后的 learningWordsSurplusPreload 时，进行下一页题目预加载
      if (store.$state.learning!.wordList.length - store.$state.learning!.wordsIndex <= config.learningWordsSurplusPreload) {
        this.triggerEvent('loadMoreWords')
      }

      await sleep(800)
      this.clearStateInit()
      await sleep(220) // NOTE: 延迟一小会，等选项动画开始切换了，再切换题目
      store.setState({ learning: { ...store.$state.learning!, wordsIndex: store.$state.learning!.wordsIndex + 1 } })
    }, 500),

    playOptionsAnimation () {
      const animate = wx.createAnimation({ duration: 550, timingFunction: 'ease-in-out' })
      animate.scaleX(0.1).opacity(0.1).step()
      animate.scaleX(1).opacity(1).step()
      this.setData({ optionsAnimation: animate.export() })
    },
    clearStateInit (playAnimation = true) {
      playAnimation && this.playOptionsAnimation()
      this.setData({ selectIndex: OptionIndex.notSelect })
    }
  }
})
