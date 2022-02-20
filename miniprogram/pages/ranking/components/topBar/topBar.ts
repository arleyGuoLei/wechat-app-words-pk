import { IRankingType } from './../../../../../typings/data'

App.Component({
  properties: {
    type: String
  },
  methods: {
    onTab (event: WechatMiniprogram.BaseEvent<WechatMiniprogram.IAnyObject, {type: IRankingType }>) {
      const { type } = event.currentTarget.dataset
      this.triggerEvent('change', { type })
    }
  }
})
