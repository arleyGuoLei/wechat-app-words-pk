/**
 * 为 npm 包新增定义文件教程：https://ts.xcatliu.com/basics/declaration-files.html
 */

/// <reference path="./../wx/lib.wx.page.d.ts" />

export default Store

interface Options<T> {
  state: T
  pageListener: Partial<WechatMiniprogram.Page.ILifetime> & ThisType<{route: string}>
}

declare class Store<T> {
  $state: T
  constructor (options: Options<T>)
  getState (): T

  setState <Cb>(state: {
    [key in keyof T]?: T[key]
  }, callback?: Cb): void
}
