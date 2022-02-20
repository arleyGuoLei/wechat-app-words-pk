import Base from './base'
import { User, Book } from './../../typings/model'
import { IRankingType, ILearningRanking, IExperienceRanking } from './../../typings/data'

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
   * @param isWin 对战模式是否获得胜利，当 type = combat 时需要传入
   * @param type 词力值增加途径来源 combat: 对战模式，还可能是每日词汇等
   */
  async incExperience (score: number, isWin: boolean, type = 'combat'): Promise<boolean> {
    const data = type === 'combat' // 对战模式
      ? {
          experience: this.db.command.inc(score),
          winGames: this.db.command.inc(isWin ? 1 : 0),
          totalGames: this.db.command.inc(1)
        }
      : { // 其他形式来源的词力值增加
          experience: this.db.command.inc(score)
        }

    const { stats: { updated } } = await this.model.where({ _openid: '{openid}' }).update({
      data
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  async updateConfig (key: keyof User['config'], value: boolean | string): Promise<boolean> {
    const { stats: { updated } } = await this.model.where({ _openid: '{openid}' }).update({
      data: {
        config: {
          [key]: value
        }
      }
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  /**
   * 增加提示卡
   * @param inc 增加的数目
   */
  async addTotalTip (inc: number): Promise<boolean> {
    const { stats: { updated } } = await this.model.where({ _openid: '{openid}' }).update({
      data: {
        totalTip: this.db.command.inc(inc)
      }
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  async updateLearing (score: number, bookShortName: string): Promise<boolean> {
    const { stats: { updated } } = await this.model.where({
      _openid: '{openid}',
      learning: {
        maxScore: this.db.command.lte(score)
      }
    }).update({
      data: {
        learning: {
          maxScore: score,
          bookShortName
        }
      }
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  /**
   * 获取每日词汇的当前得分再所有人中的排名
   * @param score 当前得分
   */
  async getLearingScoreRank (score: number): Promise<number> {
    const { total: number } = await this.model.where({
      learning: {
        maxScore: this.db.command.gte(score)
      }
    }).count()
    return number + 1
  }

  async getRanking (type: IRankingType): Promise<ILearningRanking | IExperienceRanking | null> {
    const rankingData = await this.server<{state: 0, data: ILearningRanking | IExperienceRanking}, {type: IRankingType}>('user/getRanking', { type })

    if (rankingData.state !== 0) {
      return null
    }

    return rankingData.data
  }
}

export default new UserModel()
