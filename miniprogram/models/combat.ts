import Base from './base'
import type { Combat, CombatUser, COMBAT_TYPE } from './../../typings/model'
import config from './../utils/config'
import { store } from './../app'

/**
 * 所有用户可读写：{ "read": true,  "write": true }
 */
class CombatModel extends Base {
  static $collection = 'combat'

  constructor () {
    super(CombatModel)
  }

  /**
   * (预)创建房间并返回本地的房间信息
   * @param combatInfo 房间信息
   */
  async create (combatInfo: Pick<Combat, 'users' | 'book' | 'wordList' | 'type'>): Promise<Combat> {
    const { users, book, wordList, type } = combatInfo
    const combatData: Omit<Combat, '_id'> = {
      users,
      book,
      wordList,
      type,
      // 随机匹配情况下先做预创建，监听到房间数据后再修改房间状态为 create，避免出现 匹配到的用户已经加入房间，但是房主还没创建监听
      state: type === 'random' ? 'precreate' : 'create',
      next: '',
      _createTime: this.db.serverDate()
    }
    const { _id } = (await this.model.add({
      data: combatData
    }))

    return { ...combatData, _id }
  }

  /**
   * 随机匹配情况下，更新预创建的房间为创建成功
   * NOTE: 需要预创建是为了防止房主还没创建监听，就出现匹配用户进入房间的情况
   * 流程：预创建 -> 监听 -> 正式创建
   * @param _id 房间 id
   */
  async pre2Create (_id: DB.DocumentId): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state' | 'type'> & Record<string, any> = {
      _id,
      type: 'random',
      state: 'precreate',
      'users.0._openid': '{openid}' // 自己为房主
    }

    const updateData: Pick<Combat, 'state'> = {
      state: 'create' // 房间更新为创建成功状态
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
   * 1. 随机匹配情况下，还没有用户加入房间时，房主退出，则弃用房间，更改房间为 precreate 状态
   * 2. 好友对战房间，邀请好友加入对战，但是好友还没准备，自己先退出房间了，也得弃用该房间
   * @param _id 房间 id
   */
  async create2Pre (_id: DB.DocumentId, type: COMBAT_TYPE): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state' | 'type'> & Record<string, any> = {
      _id,
      type,
      state: 'create',
      'users.0._openid': '{openid}' // 自己为房主
    }

    const updateData: Pick<Combat, 'state'> = {
      state: 'precreate' // 房间更新为预创建状态，将不再接受用户匹配进入
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      return true
    }

    return false
  }

  async watch (_id: DB.DocumentId, onChange: (snapshot: DB.ISnapshot) => void, onError: (error: any) => void): Promise<DB.RealtimeListener> {
    return await new Promise((resolve) => {
      const listener = this.model.doc(_id).watch({
        onChange (snapshot) {
          if (snapshot.type === 'init') {
            resolve(listener)
          }
          onChange.call(this, snapshot)
        },
        onError
      })
    })
  }

  /**
   * 随机匹配 lock 一个房间，返回房间 id (考虑到随机匹配的并发，所以不能先查询房间，再直接更新到准备状态)
   * NOTE: 随机匹配不强制每局的单词对战数目，只限制单词书一致
   * @param user 用户数据
   */
  async lock (user: CombatUser, bookId: string): Promise<string | DB.DocumentId> {
    const where: Pick<Combat, 'state' | 'type'> & {users: DB.DatabaseQueryCommand, _createTime: DB.DatabaseQueryCommand} & Record<'book._id'|'users.0._openid', string | DB.DatabaseQueryCommand> = {
      type: 'random', // 随机匹配
      state: 'create', // 新建房间的状态
      users: this.db.command.size(1), // 已经有房主在房间且没有其他人加入
      'book._id': bookId, // 单词书和自己的一致
      'users.0._openid': this.db.command.neq(store.$state.user._openid), // 不是自己创建的房间

      // 引用的服务端时间偏移量，毫秒为单位，可以是正数或负数
      // 创建时间要 > combatRandomMaxTime 之前，以免获取到太久的异常房间
      _createTime: this.db.command.gt(this.db.serverDate({ offset: -config.combatRandomMaxTime }))
    }

    const updateData: Pick<Combat, 'state'> & {users: DB.DatabaseUpdateCommand} = {
      state: 'lock',
      users: this.db.command.addToSet(user)
    }

    const { stats: { updated } } = await this.model.where(where).update({
      data: updateData
    })

    if (updated > 0) {
      const { data } = await this.model.where({
        type: 'random',
        state: 'lock',
        'users.1._openid': '{openid}' // 匹配数组第 n 项元素：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/query-array-object.html#%E5%8C%B9%E9%85%8D%E6%95%B0%E7%BB%84
      })
        .orderBy('_createTime', 'desc') // 降序，查询最新的
        .limit(1)
        .field({ _id: true })
        .get()
      if (data[0]?._id) {
        return data[0]._id
      }
    }

    return ''
  }

  async ready (_id: DB.DocumentId, user: CombatUser, type: COMBAT_TYPE): Promise<boolean> {
    if (type === 'friend') {
      const where: Pick<Combat, '_id' | 'state' | 'type'> & {users: DB.DatabaseQueryCommand} = {
        _id,
        type,
        state: 'create',
        users: this.db.command.size(1)
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
    }

    if (type === 'random') {
      const where: Pick<Combat, '_id' | 'state' | 'type'> & Record<'users.1._openid', string> = {
        _id,
        type,
        state: 'lock',
        'users.1._openid': '{openid}'
      }

      const updateData: Pick<Combat, 'state'> = {
        state: 'ready'
      }

      const { stats: { updated } } = await this.model.where(where).update({
        data: updateData
      })

      if (updated > 0) {
        return true
      }
    }

    if (type === 'npc') {
      const where: Pick<Combat, '_id' | 'state' | 'type'> & Record<'users.0._openid', string> = {
        _id,
        type: 'random', // 只有 random 房间可以转换为人机对战
        state: 'create',
        'users.0._openid': '{openid}' // 自己是房主
      }

      const updateData: Pick<Combat, 'state' | 'type'> & {users: DB.DatabaseUpdateCommand} = {
        state: 'start', // 直接开始对战
        type: 'npc', // 房间类型转为人机
        users: this.db.command.addToSet(user) // 增加人机数据
      }

      const { stats: { updated } } = await this.model.where(where).update({
        data: updateData
      })

      if (updated > 0) {
        return true
      }
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

  /**
   * 好友对战 - 转让房间给已经准备的用户
   */
  async transfer (_id: DB.DocumentId): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state' | 'type'> & {users: DB.DatabaseQueryCommand} = {
      _id,
      state: 'ready', // 已经准备的房间
      type: 'friend', // 好友对战类型
      users: this.db.command.size(2) // 已经有两个用户在房间
    }

    const updateData: Pick<Combat, 'state'> & {users: DB.DatabaseUpdateCommand} = {
      state: 'create',
      users: this.db.command.shift()
      // NOTE: _openid 无法在前端更新，所以没有更新 combat 下的 _openid (初次创建房间的用户)
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
  * 对战过程用户离开场景
  * @param _id 房间 id
  */
  async dismiss (_id: DB.DocumentId): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state'> = {
      _id,
      state: 'start' // 对战中的房间
    }

    const updateData: Pick<Combat, 'state'> = {
      state: 'dismiss' // 房间状态更改为异常
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

    const updateData: Pick<Combat, 'state' | 'startTime'> = {
      state: 'start',
      startTime: this.db.serverDate()
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
   * @param openid 人机选择的情况下，传入人机的 openid 值
   */
  async selectOption (_id: DB.DocumentId, selectIndex: number, score: number, wordsIndex: number, userIndex: number, openid?: string): Promise<boolean> {
    const where: Pick<Combat, '_id' | 'state'> & Record<string, any> = {
      _id,
      state: 'start', // 已经开始对战的房间
      [`users.${userIndex}._openid`]: openid ?? '{openid}' // 人机或当前用户
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
