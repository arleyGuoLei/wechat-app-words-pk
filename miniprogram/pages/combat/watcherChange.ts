import { store } from './../../app'
import { Combat, COMBAT_STATE } from './../../../typings/model'
import config from './../../utils/config'
import { sleep } from './../../utils/util'

interface CombatPage {initCombatInfo: (data: Combat) => void, selectComponent: (selector: '#pkScene') => Record<'clearStateInit', () => void>}

function stateChange (this: CombatPage, updatedFields: {state: COMBAT_STATE}, doc: Combat): void {
  const { state } = updatedFields

  const { users, state: docState } = doc

  switch (state) {
    case 'ready':
    case 'create': // 好友对战房间，非房主用户退出对战房间，恢复房间状态为 create
      store.setState({
        combat: {
          ...store.$state.combat!,
          users,
          state: docState
        }
      })
      break
    case 'start':
      store.setState({
        combat: {
          ...store.$state.combat!,
          state: docState
        }
      })
      break
  }
}

type GradeChangeUpdateFields = Record<'users.0.gradeTotal' |
'users.1.gradeTotal' |
'users.0.records.tWORDS_INDEX.index' |
'users.1.records.tWORDS_INDEX.index'
, number>

function gradeChange (this: CombatPage, updatedFields: GradeChangeUpdateFields, doc: Combat, userIndex: number): void {
  // NOTE: 使用远程数据来更新本地的答题数据，只更新 gradeTotal 和 records 数组
  const combat = store.getState().combat!
  combat.users[userIndex].gradeTotal = doc.users[userIndex].gradeTotal
  combat.users[userIndex].records = doc.users[userIndex].records
  store.setState({ combat })

  // NOTE: 获取当前回答变化的题目是第几题，赋值 wordsIndex，注意正则里的 t
  const wordsIndexReg = /^users\.[01]\.records\.t(\d+)\.index$/
  let wordsIndex = -1
  for (const field of Object.keys(updatedFields)) {
    if (wordsIndexReg.test(field)) {
      wordsIndex = +field.match(wordsIndexReg)![1]
      break
    }
  }

  // 本次对战总共有多少个题目
  const totalWordsLenght = combat.wordList.length

  wx.nextTick(async () => {
    const nextCombat = store.$state.combat!
    // 用户均已经回答了本题
    if ([0, 1].every(index => typeof nextCombat.users[index].records[`t${wordsIndex}`] !== 'undefined')) {
      // NOTE: 当前题目 + 1 >= 所有的题目数量说明没有更多题目了 对战结束
      if (wordsIndex + 1 >= totalWordsLenght) {
        // TODO: 对战结束，进行结算
      } else {
        // NOTE: 还有更多的题目，切换下一题
        await sleep(config.combatNextWordWaiting)
        this.selectComponent('#pkScene').clearStateInit()
        store.setState({ combat: { ...store.$state.combat!, wordsIndex: wordsIndex + 1 } })
      }
    }
  })

  // users.0.gradeTotal 房主答题，更新 combat.user[0] 数据，只更新 gradeTotal 和 records 数组
  // users.1.gradeTotal 非房主答题，更新 combat.user[1] 数据，只更新 gradeTotal 和 records 数组

  // 如果双方的同一题都回答完毕，切换到下一题：(从 users.x.records.0.x 提取当前回答的题目，如果combat.user[0、1].records.index.score 均有值，则设置本地的 wordIndex 为 x + 1)

  // 如果 x + 1 === wordList.length 说明对战已经结束，切换下一题 = 结束

  // 结束本地直接修改状态，同时房主修改远程房间状态为对战结束
}

const updateMap = {
  state: stateChange,
  /** 选择选项后，gradeTotal 100% 变化，答对加分，答错减分 */
  'users.0.gradeTotal': function (this: CombatPage, updatedFields: GradeChangeUpdateFields, doc: Combat) {
    return gradeChange.call(this, updatedFields, doc, 0)
  },
  /** 选择选项后，gradeTotal 100% 变化，答对加分，答错减分 */
  'users.1.gradeTotal': function (this: CombatPage, updatedFields: GradeChangeUpdateFields, doc: Combat) {
    return gradeChange.call(this, updatedFields, doc, 1)
  }
}

export default function watcherChange (this: CombatPage, snapshot: DB.ISnapshot): void {
  const { type, docs } = snapshot

  const doc = docs[0]

  // NOTE: 首次初始化 watch 时 type 为 init，用做初始化数据
  if (type === 'init') {
    this.initCombatInfo(doc)
  } else {
    const docChange = snapshot?.docChanges[0]

    // NOTE: 所有变化字段的 fields 数组
    const updatedFields: Partial<Combat> = docChange?.updatedFields ?? {}

    Object.keys(updatedFields).forEach((field) => {
      const key = field as keyof typeof updateMap
      if (Object.keys(updateMap).includes(key) && typeof updateMap[key] === 'function') {
        // @ts-expect-error
        updateMap[key].call(this, updatedFields, doc)
      }
    })
  }
}
