import { getUserInfo } from './../../../../utils/helper'

App.Component({
  methods: {
    async onGetUserInfo () {
      await getUserInfo(true)
    }
  }
})
