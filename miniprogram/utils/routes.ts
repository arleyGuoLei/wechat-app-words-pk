import { Router } from 'wxapp-router'
import type { Route } from 'wxapp-router/build/main/lib/route'

const router = new Router()

export const routesConfig = [
  { path: '/home', route: '/pages/home/home' },
  { path: '/learning', route: '/pages/learning/learning' },
  { path: '/combat', route: '/pages/combat/combat' },
  { path: '/review', route: '/pages/review/review' },
  { path: '/ranking', route: '/pages/ranking/ranking' },
  { path: '/setting', route: '/pages/setting/setting' },
  { path: '/about', route: '/pages/about/about' }
]

export interface ICombatRoute {
  type: 'friend' | 'random'
  state?: 'create' | 'ready' | 'start'

  /** 上一局对战的房间 id，通过对战结束后的「再来一局」创建的房间将携带 */
  previousId?: string | DB.DocumentId

  /** 房间 id，分享邀请好友时使用 */
  id?: string | DB.DocumentId

  /** 调试状态 (对战页有些场景在用户侧是无法直接进入的，通过路由参数强制进入需要加上 debug 参数) */
  debug?: string

  /** 是否为分享结果，用于对战结束后的分享战绩标识 */
  share_result?: string
}

export interface IRoutes {
  pages: {
    /** 首页 */
    home: Route<{}>
    /** 每日词汇 */
    learning: Route<{}>
    /** 生词本 */
    review: Route<{}>
    /** 对战模式 */
    combat: Route<ICombatRoute>
    /** 排行榜 */
    ranking: Route<{}>
    /** 设置页 */
    setting: Route<{}>
    /** 关于 */
    about: Route<{}>
  }
}

router.batchRegister(routesConfig)

export default router
