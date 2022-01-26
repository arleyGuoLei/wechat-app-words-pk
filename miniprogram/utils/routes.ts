import { Router } from 'wxapp-router'
import type { Route } from 'wxapp-router/build/main/lib/route'

const router = new Router()

export const routesConfig = [
  { path: '/home', route: '/pages/home/home' },
  { path: '/combat', route: '/pages/combat/combat' }
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
    home: Route<{}>
    combat: Route<ICombatRoute>
  }
}

router.batchRegister(routesConfig)

export default router
