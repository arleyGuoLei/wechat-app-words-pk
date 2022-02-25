import { User, Book, Combat, CombatWord } from './../../typings/model'
import { AppConfig } from './../models/kv'

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

  /** 当前题是否可以答题，当答完一题时置为 false，切换下一题再切换为 true */
  canSelect?: boolean

  /** 对战过程倒计时 */
  countdown?: number
}

export type LearningWord = CombatWord

export interface LearningState {
  /** 当前分数 */
  score: number

  /** 剩余机会 */
  healthPoint: number

  /** 题目列表 */
  wordList: LearningWord[]

  /** 当前题目在整个对战题目 wordList 中的序号，从 0 开始，回答一题 + 1 */
  wordsIndex: number

  /** 题目选择倒计时 */
  countdown: number

  /** 本局每日词汇剩余未增加的词力值，在答题结束时进行结算，每答对一题增加一次分数 */
  experience: number
}

export interface State {
  cloudEnv: string
  ui: UiState

  /** 当前登录用户的数据信息 */
  user: UserInfoState

  /** 当前用户选择的单词书信息 */
  book: BookState

  /** 对战模式数据 */
  combat: CombatState | null

  /** 每日词汇数据 */
  learning: LearningState | null

  appConfig: AppConfig
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
      combatQuestionNumber: 15,
      pronounce: true,
      backgroundMusic: true,
      vibrate: true
    },
    learning: {
      maxScore: 0,
      bookShortName: ''
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
  combat: null,
  learning: null,
  appConfig: {
    backgroundMusicUrl: '',
    wechat: '34805850',
    about: ''
  }
}

export default state
