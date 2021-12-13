type ILoading = WechatMiniprogram.Component.Instance<
WechatMiniprogram.IAnyObject,
WechatMiniprogram.IAnyObject,
{ show: (text?: string) => void, hide: () => void }
>

function getLoaingComponent (): ILoading | null {
  const page = getCurrentPages()
  if (!page.length) { return null }

  return (page[page.length - 1].selectComponent('#loading')) as ILoading
}

export const loading = {
  show (text?: string) {
    const loading = getLoaingComponent()
    if (loading) { loading.show(text) }
  },
  hide () {
    const loading = getLoaingComponent()
    if (loading) { loading.hide() }
  }
}
