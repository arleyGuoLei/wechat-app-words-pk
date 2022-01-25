import { store } from './../../app'
import { Combat, COMBAT_STATE } from './../../../typings/model'
import config from './../../utils/config'
import { sleep, toast } from './../../utils/util'
import combatModel from './../../models/combat'

interface CombatPage {initCombatInfo: (data: Combat) => void, selectComponent: (selector: '#pkScene' | '#randomScene') => Record<'clearStateInit' | 'startCombat', (doc?: Combat) => void>, randomCombat: () => Promise<boolean>}

async function stateChange (this: CombatPage, updatedFields: {state: COMBAT_STATE}, doc: Combat): Promise<void> {
  const { state } = updatedFields

  const { state: docState, users, type, _id } = doc

  switch (state) {
    case 'ready': // 好友对战用户直接 ready || (匹配对战用户自动 ready，需要自动开始对战)
    case 'create': // (好友对战房间，非房主用户退出对战房间，恢复房间状态为 create || 随机匹配房主更新房间状态从 precreate 到 create)
      store.setState({
        combat: {
          ...store.$state.combat!,
          ...doc,
          isOwner: store.$state.user._openid === users[0]?._openid // 是否为房主 (房主用户在用户准备阶段退出，转让房间给普通用户，房主状态也同时变化)
        }
      })

      // NOTE: 匹配对战的用户准备，并且当前用户是房主，自动开始对战
      if (state === 'ready' && type === 'random' && store.$state.user._openid === users[0]?._openid) {
        console.log('随机匹配自动开始对战')

        const isStart = await combatModel.start(_id, 'random')

        if (!isStart) {
          // NOTE: 随机匹配开始失败，边界情况：正好开始对局，随机匹配的用户正好退出匹配页面
          // 再次创建随机匹配房间
          void this.randomCombat()
        }
      }
      break
    case 'start':
    case 'lock': // 随机匹配有用户锁定房间时，房主本地也调整状态到 lock
      if (type === 'random' && state === 'start') {
        // 使用匹配组件开始对战，先显示一下匹配成功 (显示时长根据开始时间做计算)，然后再开始对战
        this.selectComponent('#randomScene').startCombat(doc)
      } else if (type === 'npc' && state === 'start') {
        store.setState({
          combat: {
            ...store.$state.combat!,
            ...doc, // 人机的用户信息同步至本地
            state: docState
          }
        })
      } else {
        store.setState({
          combat: {
            ...store.$state.combat!,
            state: docState
          }
        })
      }
      break
    case 'dismiss':
      await toast.show('对方逃离, 提前结束对战...', 2000)
      store.setState({ combat: { ...store.$state.combat!, state: 'end' } })
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
      await sleep(config.combatNextWordWaiting)

      // NOTE: 当前题目 + 1 >= 所有的题目数量说明没有更多题目了 对战结束
      if (wordsIndex + 1 >= totalWordsLenght) {
        store.setState({ combat: { ...store.$state.combat!, state: 'end' } })
      } else {
        // NOTE: 还有更多的题目，切换下一题
        this.selectComponent('#pkScene').clearStateInit()
        await sleep(220) // NOTE: 延迟一小会，等选项动画开始切换了，再切换选项按钮上的文案
        store.setState({ combat: { ...store.$state.combat!, wordsIndex: wordsIndex + 1 } })
      }
    }
  })
}

function nextChange (this: CombatPage, updatedFields: {next: DB.DocumentId}): void {
  const { next } = updatedFields
  if (next) {
    store.setState({ combat: { ...store.$state.combat!, next } })
  }
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
  },
  next: nextChange
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
