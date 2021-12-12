import { IAppOption } from 'miniprogram/app'

export default class {
  collection: string

  constructor (Model: Function & { $collection: string }) {
    if (typeof Model.$collection !== 'string') {
      throw Error('Model 需要增加 $collection 静态属性，用于绑定集合名称')
    }
    this.collection = Model.$collection
  }

  get model (): DB.CollectionReference {
    const db = wx.cloud.database({ env: getApp<IAppOption>().store.$state.cloudEnv })
    return db.collection(this.collection)
  }

  async server <R, T>(url: string, data?: T): Promise<R> {
    const { result } = await wx.cloud.callFunction({
      name: 'server',
      data: {
        url,
        ...data
      }
    })

    return result as R
  }
}
