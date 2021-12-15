import { User, Book } from './../../typings/model'

interface UiState {
  statusBarHeight: number
  CustomBarHeight: number
  screenHeight: number
  windowWidth: number
}

interface UserInfoState extends User {}

interface BookState extends Book {}

export interface State {
  cloudEnv: string
  ui: UiState

  /** 当前登录用户的数据信息 */
  user: UserInfoState

  /** 当前用户选择的单词书信息 */
  book: BookState
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
    experience: 0,
    totalGames: 0,
    winGames: 0,
    totalTip: 0,
    avatar: '',
    nickname: '',
    bookId: ''
  },
  book: {
    shortName: '',
    name: '',
    image: '',
    peopleNumber: 0,
    wordsNumber: 0,
    _id: '',
    sort: 0
  }
}

export default state
