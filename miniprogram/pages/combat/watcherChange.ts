import { store } from './../../app'
import { Combat, COMBAT_STATE, CombatUser } from './../../../typings/model'

interface CombatPage {initCombatInfo: (data: Combat) => void}

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
      // TODO: start 对局
      store.setState({
        combat: {
          ...store.$state.combat!,
          state: docState
        }
      })
      break
  }
}

function usersChange (this: CombatPage, updatedFields: {users: CombatUser[]}, doc: Combat): void {

}

const updateMap = {
  state: stateChange,
  users: usersChange
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
