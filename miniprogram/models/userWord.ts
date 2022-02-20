import Base from './base'
import { IUserWords } from './../../typings/data'

/**
 * 权限: 仅创建者可读写
 */
class UserWordModel extends Base {
  static $collection = 'userWord'

  constructor () {
    super(UserWordModel)
  }

  async add (wordId: string): Promise<DB.DocumentId> {
    const { _id } = (await this.model.add({
      data: {
        wordId,
        _createTime: this.db.serverDate(),
        timestamp: Date.now() // serverDate 不支持 sort 排序，增加时间戳整数用于排序查询
      }
    }))
    return _id
  }

  /**
   * 根据生词 id 删除生词本词汇
   * @param id 生词本的词汇 _id
   */
  async delete (id: DB.DocumentId): Promise<boolean> {
    const { stats: { removed } } = await this.model.doc(id).remove()

    if (removed) {
      return true
    }
    return false
  }

  async getMyList (page: number): Promise<IUserWords | null> {
    const { state, data } = await this.server<{state: 0, data: IUserWords}, {page: number}>('user/getReviewList', {
      page
    })
    if (state !== 0) { return null }

    return data
  }

  async deleteAll (): Promise<boolean> {
    const deleted = await this.server<{state: 0, data: boolean}, undefined>('user/clearUserWords')

    if (deleted.state !== 0) {
      return false
    }

    return deleted.data
  }
}

export default new UserWordModel()
