import Base from './base'
import { IUserWords } from './../../typings/model'

/**
 * 权限: 仅创建者可读写
 */
class UserWordModel extends Base {
  static $collection = 'userWord'

  constructor () {
    super(UserWordModel)
  }

  async add (wordId: string): Promise<DB.DocumentId> {
    const { _id } = (await this.model.add({ data: { wordId, _createTime: this.db.serverDate() } }))
    return _id
  }

  async getMyList (page: number): Promise<IUserWords | null> {
    const { state, data } = await this.server<{state: 0, data: IUserWords}, {page: number}>('user/getReviewList', {
      page
    })
    if (state !== 0) { return null }

    return data
  }
}

export default new UserWordModel()
