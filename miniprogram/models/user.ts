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
      nickname: ''
    }
    return await this.model.add({ data: userDefault })
  }

  async login (): Promise<User> {
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
