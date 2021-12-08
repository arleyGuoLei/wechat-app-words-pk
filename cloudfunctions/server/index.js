const TcbRouter = require('tcb-router')
const cloud = require('wx-server-sdk')
const userController = require('./controller/user')
const initData = require('./middleware/initData')
const initAction = require('./middleware/initAction')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  // 挂载一些初始化数据至 ctx.data
  app.use(initData(cloud, event, context))

  // TODO: 这样写 action 传不回来了
  // 将小程序端的 action 参数解析至对应 Controller 的 action
  app.use(initAction)

  app.router('user', userController.login)
  return app.serve()
}
