module.exports = (cloud, event, context) => {
  return async (ctx, next) => {
    const wxContext = cloud.getWXContext()
    ctx.data.openid = wxContext.OPENID
    ctx.data.wxContext = wxContext
    ctx.data.context = context
    ctx.data.event = event
    await next()
  }
}
