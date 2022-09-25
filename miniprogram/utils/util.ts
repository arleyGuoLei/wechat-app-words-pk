type ILoading = WechatMiniprogram.Component.Instance<
WechatMiniprogram.IAnyObject,
WechatMiniprogram.IAnyObject,
{ show: (text?: string) => void, hide: () => void }
>

type IToast = WechatMiniprogram.Component.Instance<
WechatMiniprogram.IAnyObject,
WechatMiniprogram.IAnyObject,
{ show: (text?: string, duration?: number, width?: number, toastId?: string) => Promise<string>, hide: (toastId?: string) => void }
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

function getToastComponent (toastId: string): IToast | null {
  const page = getCurrentPages()
  if (!page.length) { return null }

  return (page[page.length - 1].selectComponent(`#${toastId}`)) as IToast
}

export const toast = {
  async show (text = '', duration?: number, width?: number, toastId = 'toast') {
    const _toast = getToastComponent(toastId)
    if (_toast) { return await _toast.show(text, duration, width) }

    return await Promise.reject(new Error('not find toast component'))
  },
  hide (toastId = 'toast') {
    const _toast = getToastComponent(toastId)
    if (_toast) { _toast.hide() }
  }
}

export const throttle = function (fn: Function, gapTime = 500): Function {
  let _lastTime: number
  return function () {
    const _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      // @ts-expect-errorts-ignore
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}

export async function sleep (time = 2000): Promise<number> {
  return await new Promise((resolve) => { setTimeout(() => { resolve(time) }, time) })
}

/**
 * 把数组分割成长度为size的数组
 * @param {array} arr 数组
 * @param {number} size 每一个数组的长度
 */
export function chunk<T> (arr: T[], size: number): T[][] {
  const arr2 = []
  for (let i = 0; i < arr.length; i = i + size) {
    arr2.push(arr.slice(i, i + size))
  }
  return arr2
}

export function playAudio (src: string): void {
  const innerAudioContext = wx.createInnerAudioContext({ useWebAudioImplement: true })
  innerAudioContext.autoplay = true
  innerAudioContext.src = src
  innerAudioContext.onError((res) => console.log(res))
}

export function playPronunciation (word: string): void {
  // NOTE: 网上可以搜到很多的单词发音接口，搜索「单词发音接口」，自行修改下方 src 链接
  const src = ''

  !src && console.log(`playPronunciation -> ${word}，请网上自行找一个「单词发音接口」从而实现单词发音功能`)

  src && playAudio(src)
}
