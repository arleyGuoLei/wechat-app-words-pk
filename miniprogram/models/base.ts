import { IAppOption } from 'miniprogram/app'
import type { DB as serverDB } from 'typings/types/wx/wx-server-sdk'

export default class {
  collection: string

  constructor (Model: Function & { $collection: string }) {
    if (typeof Model.$collection !== 'string') {
      throw Error('Model 需要增加 $collection 静态属性，用于绑定集合名称')
    }
    this.collection = Model.$collection
  }

  get model (): serverDB.CollectionReference {
    // NOTE: miniprogram-api-typings 中的云函数操作类型定义不全，使用 wx-server-sdk 中的方法来替代
    const db = wx.cloud.database({ env: getApp<IAppOption>().store.$state.cloudEnv })
    return db.collection(this.collection) as unknown as serverDB.CollectionReference
  }

  get db (): DB.Database {
    const db = wx.cloud.database({ env: getApp<IAppOption>().store.$state.cloudEnv })
    return db
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
