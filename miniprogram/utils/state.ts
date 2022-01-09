import { User, Book, Combat } from './../../typings/model'

interface UiState {
  statusBarHeight: number
  CustomBarHeight: number
  screenHeight: number
  windowWidth: number
}

export interface UserInfoState extends User {}

export interface BookState extends Book {}

export interface CombatState extends Combat {
  /** 是否为房主 */
  isOwner?: boolean

  /** 当前对战的 word 在整个对战题目的序号，从 0 开始，回答一题 + 1 */
  wordsIndex?: number
}

export interface State {
  cloudEnv: string
  ui: UiState

  /** 当前登录用户的数据信息 */
  user: UserInfoState

  /** 当前用户选择的单词书信息 */
  book: BookState

  combat: CombatState | null
}

const state: State = {
  cloudEnv: '',
  ui: {
    statusBarHeight: 0,
    CustomBarHeight: 0,
    screenHeight: 0,
    windowWidth: 0
  },
  user: {
    _openid: '',
    experience: 0,
    totalGames: 0,
    winGames: 0,
    totalTip: 0,
    avatar: '',
    nickname: '',
    bookId: '',
    config: {
      combatQuestionNumber: 10,
      pronounce: true,
      backgroundMusic: true,
      vibrate: true
    }
  },
  book: {
    shortName: '',
    name: '',
    image: '',
    peopleNumber: 0,
    wordsNumber: 0,
    _id: '',
    sort: 0
  },
  combat: null
}

export default state
