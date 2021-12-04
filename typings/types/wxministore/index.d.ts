/**
 * 为 npm 包新增定义文件教程：https://ts.xcatliu.com/basics/declaration-files.html
 */

export default Store

interface Options<T> {
  state: T
}

declare class Store<T> {
  $state: T
  constructor (options: Options<T>)
  getState (): T

  setState (state: {
    [key in keyof T]?: T[key]
  }): void
}
