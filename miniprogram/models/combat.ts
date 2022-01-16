import Base from './base'
import type { Combat, CombatUser, COMBAT_TYPE } from './../../typings/model'

/**
 * 所有用户可读写：{ "read": true,  "write": true }
 */
class CombatModel extends Base {
  static $collection = 'combat'

  constructor () {
    super(CombatModel)
  }

  /**
   * 创建房间并返回本地的房间信息
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
    }))

    return { ...combatData, _id }
  }

  async watch (_id: DB.DocumentId, onChange: (snapshot: DB.ISnapshot) => void, onError: (error: any) => void): Promise<DB.RealtimeListener> {
    const listener = await this.model.doc(_id).watch({
      onChange,
      onError
    })

    return listener
  }

  async ready (_id: DB.DocumentId, user: CombatUser, type: COMBAT_TYPE): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state' | 'type'> & {users: DB.DatabaseQueryCommand} = {
      _id,
      type, // 好友对战类型
      state: 'create', // 新建房间的状态
      users: this.db.command.size(1) // 已经有房主在房间且没有其他人加入
    }

    const updateData: Pick<Combat, 'state'> & {users: DB.DatabaseUpdateCommand} = {
      state: 'ready',
      users: this.db.command.addToSet(user)
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  /**
   * 好友对战 - 准备阶段选择退出房间
   * @param _id 房间 id
   */
  async exit (_id: DB.DocumentId): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state' | 'type'> & Record<string, any> = {
      _id,
      type: 'friend', // 好友对战类型
      state: 'ready', // 新建房间的状态
      'users.1._openid': '{openid}' // 自己为当前加入对战的用户
    }

    const updateData: Pick<Combat, 'state'> & {users: DB.DatabaseUpdateCommand} = {
      state: 'create', // 恢复房间为创建状态
      users: this.db.command.pop()
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  async start (_id: DB.DocumentId, type: COMBAT_TYPE): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state' | 'type'> & {users: DB.DatabaseQueryCommand} & Record<string, any> = {
      _id,
      type,
      state: 'ready', // 已经准备的房间
      users: this.db.command.size(2), // 房间人数为 2
      'users.0._openid': '{openid}' // 当前的用户为房间创建者
    }

    const updateData: Pick<Combat, 'state'> = {
      state: 'start'
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  /**
   * 对战过程选择题目
   * @param _id 房间 id
   * @param selectIndex 选择的选项 index，0 ~ 3，-1 表示选择错误
   * @param score 本题获得的分数
   * @param wordsIndex 当前题目的 index
   * @param userIndex 用户是哪一个？房主为 0，普通用户为 1+
   */
  async selectOption (_id: DB.DocumentId, selectIndex: number, score: number, wordsIndex: number, userIndex: number): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state'> & Record<string, any> = {
      _id,
      state: 'start', // 已经开始对战的房间
      [`users.${userIndex}._openid`]: '{openid}' // 当前用户
    }

    const updateData: Record<string, DB.DatabaseUpdateCommand | CombatUser['records']> = {
      [`users.${userIndex}.gradeTotal`]: this.db.command.inc(score),
      // NOTE: index 增加 t 前缀的原因：wxs 中(pkScene.wxs)的对象 key 值不能为数字，不然取不到值；另外也是为了和数组做区分
      [`users.${userIndex}.records.t${wordsIndex}`]: {
        index: selectIndex,
        score
      }
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  async end (_id: DB.DocumentId): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state'> & Record<string, any> = {
      _id,
      state: 'start', // 对战中的房间
      'users.0._openid': '{openid}' // 当前的用户为房间创建者
    }

    const updateData: Pick<Combat, 'state'> = {
      state: 'end'
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  /**
   * 对战结束后再来一局的房间创建
   * NOTE: 对战结束后房主可以选择再来一局进行房间创建，先是本地修改了房间数据，然后关闭当前对战页，打开新的好友对战房间，获取到下一局的房间 id，这时候进行上一局房间的 next 写入为当前创建的房间 id；上一局的非房主用户监听到 next 数据变化，就可以点击再来一局，点击后跳转至当前对战房间
   * @param _id 上一局对战房间的房间 id
   */
  async updateNext (previousId: DB.DocumentId, next: DB.DocumentId): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state'> & Record<string, any> = {
      _id: previousId,
      state: 'end', // 已经结束对战的房间
      'users.0._openid': '{openid}' // 当前的用户为房间创建者
    }

    const updateData: Pick<Combat, 'next'> = { next }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }
}

export default new CombatModel()
