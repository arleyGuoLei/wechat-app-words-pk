import Base from './base'
import type { Combat } from './../../typings/model'

/**
 * 所有用户可读写：{ "read": true,  "write": true }
 */
class CombatModel extends Base {
  static $collection = 'combat'

  constructor () {
    super(CombatModel)
  }

  /**
   * 创建房间并返回房间信息
   * @param combatInfo 房间信息
   */
  async create (combatInfo: Pick<Combat, 'users' | 'book' | 'wordList' | 'type'>): Promise<Combat> {
    const { users, book, wordList, type } = combatInfo
    const combatData: Omit<Combat, '_id'> = {
      users,
      book,
      wordList,
      type,
      state: 'create',
      next: '',
      _createTime: this.db.serverDate()
    }
    const { _id } = (await this.model.add({
      data: combatData
    })) as DB.IAddResult

    return { ...combatData, _id }
  }
}

export default new CombatModel()
