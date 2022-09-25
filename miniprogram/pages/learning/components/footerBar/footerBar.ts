import { store, events } from './../../../../app'
import userModel from './../../../../models/user'
import { playPronunciation } from './../../../../utils/util'

let bgm = wx.createInnerAudioContext({ useWebAudioImplement: true })

App.Component({
  options: {
    addGlobalClass: true
  },
  lifetimes: {
    ready () {
      this.initBgm()
      events.on('playLearningPronunciation', this.onPlayPronunciation.bind(this))
      events.on('playLearningBgm', this.playBgm.bind(this))
    },
    detached () {
      this.playBgm(false)
      events.off('playLearningPronunciation')
      events.off('playLearningBgm')
      bgm?.destroy()
    }
  },
  methods: {
    initBgm () {
      bgm = wx.createInnerAudioContext({ useWebAudioImplement: true })
      bgm.loop = true
      bgm.autoplay = false
      bgm.src = store.$state.appConfig.backgroundMusicUrl

      // NOTE: 延迟一会儿再播放，偶现不延迟直接播放没有声音
      setTimeout(() => { this.playBgm() }, 800)
    },
    playBgm (play = true) {
      wx.nextTick(() => {
        play && store.$state.user.config.backgroundMusic && bgm?.play()
        !play && bgm?.pause()
      })
    },
    onBgmChange (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {action: 'start' | 'pause'} >) {
      const { action = 'start' } = event.currentTarget.dataset
      const play = action === 'start'

      const user = store.getState().user
      user.config.backgroundMusic = play
      store.setState({ user })

      this.playBgm(play)

      void userModel.updateConfig('backgroundMusic', play)
    },

    onPlayPronunciation () {
      const wordList = store.$state.learning?.wordList!

      if (!wordList.length) { return }

      const wordsIndex = store.$state.learning?.wordsIndex!
      playPronunciation(wordList[wordsIndex].word)
    },

    onGetTip () { events.emit('onGetLearningTip') }

  }
})
