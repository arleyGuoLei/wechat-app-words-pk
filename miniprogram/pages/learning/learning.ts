import wordModel from './../../models/word'
import config from './../../utils/config'
import { store, IAppOption, events } from './../../app'
import { formatWordList } from './../../utils/helper'
import { loading, toast } from './../../utils/util'

const app = getApp<IAppOption>()

/** 是否通过分享后，再次显示当前页面 */
let isShareBack = false

App.Page({
  async onLoad () {
    await app.$loginAsync
    await this.initPageData()
  },

  async initPageData () {
    if (!store.$state.user?.bookId) {
      toast.show('获取用户数据失败，请重试', 1200).finally(() => { this.onBack() })
      return
    }

    loading.show('加载中 ...')

    void wx.setNavigationBarTitle({ title: store.$state.book.name })

    await new Promise(resolve => store.setState({
      learning: {
        wordsIndex: 0,
        score: 0,
        healthPoint: config.learningHealthPoint,
        wordList: [],
        countdown: config.learningCountDown,
        experience: 0
      }
    }, resolve))

    await this.loadWordsData()
    loading.hide()
  },

  async loadWordsData () {
    const userinfo = store.$state.user

    // NOTE: 1. 获取单词数据
    const words = await wordModel.getRandomWords(userinfo.bookId, config.learningPageSize * config.learningOptionNumber)

    // NOTE: 2. 格式化单词数据
    const wordList = formatWordList(words, config.learningOptionNumber)

    // NOTE: 3. 本地 store 的数据增加网络上获取的最新数据
    store.setState({ learning: { ...store.$state.learning!, wordList: store.$state.learning!.wordList.concat(wordList) } })
  },

  onBack () {
    if (getCurrentPages().length === 1) {
      void app.routes.pages.home.redirectTo({})
    } else {
      void app.router.navigateBack({ delta: 1 })
    }
  },

  onShow () {
    if (isShareBack) {
      events.emit('showLearningPopup', false) // 隐藏分享弹窗
      events.emit('learningNextWord', 'share') // 通过分享途径切换下一题
      events.emit('playLearningBgm', true)
      isShareBack = false
    }
  },

  onShareAppMessage ({ from }) {
    if (from === 'button') {
      isShareBack = true
      return {
        title: `❤ 我正在练习「${store.getState().book.name}」，每天进步积累一点哦 ~`,
        path: '/pages/home/home',
        imageUrl: './../../images/share-pk-bg.png'
      }
    }

    return config.defaultShare
  }
})
