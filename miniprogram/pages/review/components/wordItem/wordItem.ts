import { Word } from './../../../../../typings/model'
import { playPronunciation } from './../../../../utils/util'
import userWord from './../../../../models/userWord'

App.Component({
  properties: {
    index: Number,
    userWord: Object
  },
  data: {
    status: 'delete',
    showTrans: false
  },
  options: {
    addGlobalClass: true
  },
  methods: {
    onLongpress () {
      void wx.vibrateShort({ type: 'light' })
      this.setData({ status: this.data.status === 'audio' ? 'delete' : 'audio' })
    },
    onTapWord () {
      this.setData({ showTrans: !this.data.showTrans })
    },
    onPlayAudio () {
      const { word } = this.properties.userWord as Word
      playPronunciation(word)
    },
    onDelete () {
      wx.showModal({
        title: '提示',
        content: '是否确定删除当前生词?',
        confirmText: '删除',
        confirmColor: '#E95F56',
        success: async (res) => {
          if (res.confirm) {
            try {
              const { _id } = this.properties.userWord as Word
              const index = this.properties.index
              const isRemoved = await userWord.delete(_id)
              if (isRemoved) {
                this.triggerEvent('delete', { _id, index })
                return
              }
              throw new Error('数据表中的生词删除失败')
            } catch (error) {
              void wx.showToast({ title: '删除失败，请重试', icon: 'none', duration: 2000 })
            }
          }
        }
      })
    }
  }
})
