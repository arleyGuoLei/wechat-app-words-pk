import { IAppOption } from './../../../../app'

const app = getApp<IAppOption>()

App.Component({
  options: {
    /** 页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面 */
    /** 为了使用 app.wxss 中定义的一些全局样式，比如：.shadow-lg 和 动画库 */
    addGlobalClass: true
  },
  methods: {
    onToRanking () {
      void app.routes.pages.ranking.go({})
    },
    onAbout () {
      void app.routes.pages.about.go({})
    }
  }
})
