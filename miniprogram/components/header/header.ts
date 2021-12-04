import { IAppOption } from './../../app'

App.Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  data: {
    CustomBarHeight: getApp<IAppOption>().store.$state.ui.CustomBarHeight,
    StatusBarHeight: getApp<IAppOption>().store.$state.ui.statusBarHeight
  }
})
