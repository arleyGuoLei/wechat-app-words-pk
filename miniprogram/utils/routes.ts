import { Router } from 'wxapp-router'
import type { Route } from 'wxapp-router/build/main/lib/route'

const router = new Router()

export const routesConfig = [
  { path: '/home', route: '/pages/home/home' },
  { path: '/combat', route: '/pages/combat/combat' }
]

export interface IRoutes {
  pages: {
    home: Route<{}>
    combat: Route<{}>
  }
}

router.batchRegister(routesConfig)

export default router
