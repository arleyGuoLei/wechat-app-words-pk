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

  /**
   * 对战结算，增加用户词力值 (数据按照计划是需要做接口加密的，做的时候发现微信小程序云开发的数据传输已经做了很严密的数据加密，Charles 手机上和电脑上的小程序都抓不到 http 的数据包，模拟器上的云开发相关请求显示出来的接口也是假的，所以不用担心数据安全问题)
   * @param score 增加的词力值
   */
  async incExperience (score: number): Promise<boolean> {
    const { stats: { updated } } = await this.model.where({ _openid: '{openid}' }).update({ data: { experience: this.db.command.inc(score) } })

    if (updated > 0) {
      return true
    }

    return false
  }
}

export default new UserModel()
