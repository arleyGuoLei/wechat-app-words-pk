import { Router } from 'wxapp-router'
import type { Route } from 'wxapp-router/build/main/lib/route'

const router = new Router()

export const routesConfig = [
  { path: '/home', route: '/pages/home/home' },
  { path: '/combat', route: '/pages/combat/combat' }
]

export interface ICombatRoute {
  type: 'friend' | 'random'
  state?: 'create' | 'ready'
  /** 房间 id，分享邀请好友时使用 */
  id?: string
}

export interface IRoutes {
  pages: {
    home: Route<{}>
    combat: Route<ICombatRoute>
  }
}

router.batchRegister(routesConfig)

export default router
