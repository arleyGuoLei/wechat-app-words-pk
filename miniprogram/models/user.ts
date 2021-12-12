import Base from './base'
import { User, Book } from './../../typings/model'

type LoginUserInfo = User & { book: Book[] }

class UserModel extends Base {
  static $collection = 'user'

  constructor () {
    super(UserModel)
  }

  async login (): Promise<LoginUserInfo> {
    const userinfo = await this.server<{state: 0, data: LoginUserInfo}, undefined>('user/login')

    if (userinfo.state !== 0) {
      // NOTE: 登录失败，进行重试
      return await this.login()
    }

    return userinfo.data
  }
}

export default new UserModel()
