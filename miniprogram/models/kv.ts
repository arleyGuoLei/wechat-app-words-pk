import Base from './base'

export interface INPC {
  _openid: string
  avatar: string
  nickname: string
}

export interface AppConfig {
  /** 对战背景音乐 */
  backgroundMusicUrl: string
  wechat: string
  about: string
}

export interface IKV {
  npc: INPC[]
  config: AppConfig
}

class KvModel extends Base {
  static $collection = 'kv'

  constructor () {
    super(KvModel)
  }

  async getData<T extends keyof IKV> (key: T): Promise<IKV[T] | null> {
    const { data } = await this.model
      .where({ key })
      .limit(1)
      .get()

    if (data.length) {
      return data[0].value as unknown as IKV[T]
    }

    return null
  }
}

export default new KvModel()
