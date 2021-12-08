import Base from './base'

export interface User {
  /** 词力值 */
  experience: number

  /** 总对战次数 */
  totalGames: number

  /** 对局胜利次数 */
  winGames: number

  /** 提示卡数目 */
  totalTip: number

  /** 用户头像信息 */
  avatar: string

  /** 用户昵称 */
  nickname: string

  /** 当前选择的单词书 id */
  bookId: string
}

class UserModel extends Base {
  static $collection = 'user'

  constructor () {
    super(UserModel)
  }

  async register (): Promise<DB.IAddResult> {
    const userDefault: User = {
      experience: 0,
      totalGames: 0,
      winGames: 0,
      totalTip: 0,
      avatar: '',
      nickname: '',

      // 默认选中随机单词书
      bookId: 'random'
    }
    return await this.model.add({ data: userDefault })
  }

  async login (): Promise<User> {
    // TIP: 由于联表查询 lookup 不支持小程序端直接调用，故没有将 bookId 直接转为用户所选单词书，具体可参考 ↓
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/join.html
    // 有两个方案：
    // 1. 使用云函数来做联表查询，导出 book 相关数据
    // 2. 单独查询所有单词书，根据 bookId 关联到当前选择的单词书

    const { data: user } = await this.model
      .where({ _openid: '{openid}' })
      .field({
        _id: false,
        _openid: false
      })
      .get()
    if (user.length === 0) {
      await this.register()
      return await this.login()
    }
    return user[0] as User
  }
}

export default new UserModel()
