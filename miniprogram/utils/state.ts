interface UiState {
  statusBarHeight: number
  CustomBarHeight: number
  screenHeight: number
  windowWidth: number
}

interface UserInfoState {
  /** 词力值 */
  experience: number

  /** 总对战次数 */
  totalGames: number

  /** 对局胜利次数 */
  winGames: number

  /** 提示卡数目 */
  totalTip: number

  /** 用户头像信息 */
  avatar: string

  /** 用户昵称 */
  nickname: string
}

interface BookState {
  shortName: string
}

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
    avatar: 'https://pic1.zhimg.com/v2-7d7b15a4bb1daba4c076ba358d0e5c0a_xll.jpg',
    nickname: '独立开发者磊子'
  },
  book: {
    shortName: 'CET4'
  }
}

export default state
