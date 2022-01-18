import Base from './base'

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
}

export default new UserWordModel()
