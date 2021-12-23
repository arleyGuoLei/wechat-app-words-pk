import Base from './base'
import { User, Book } from './../../typings/model'

type LoginUserInfo = User & { book: Book[] }

class UserModel extends Base {
  static $collection = 'user'

  constructor () {
    super(UserModel)
  }

  /**
   * 更新用户头像、昵称信息
   * @param userinfo 用户信息
   */
  async updateUserInfo (userinfo: User): Promise<void> {
    const { avatar, nickname } = userinfo
    await this.model.where({ _openid: '{openid}' }).update({ data: { avatar, nickname } })
  }

  async login (): Promise<LoginUserInfo> {
    const userinfo = await this.server<{state: 0, data: LoginUserInfo}, undefined>('user/login')

    if (userinfo.state !== 0) {
      // NOTE: 登录失败，进行重试
      return await this.login()
    }

    return userinfo.data
  }

  async changeSelectBook (newSelectBookId: string, oldSelectBookId: string): Promise<boolean> {
    const changeLog = await this.server<
    {state: 0, data: string},
    {newSelectBookId: string, oldSelectBookId: string}
    >('user/changeSelectBook', {
      newSelectBookId,
      oldSelectBookId
    })

    if (changeLog.state === 0) {
      return true
    }

    return false
  }
}

export default new UserModel()
