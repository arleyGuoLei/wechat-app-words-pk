import { DB } from './types/wx/wx-server-sdk'

interface UserConfig {
  /** 对战模式每局的单词数目 */
  combatQuestionNumber: number

  /** 切换单词时，是否自动发音 */
  pronounce: boolean

  /** 对战 和 PK 模式是否播放背景音 */
  backgroundMusic: boolean

  /** 单词选择错误时，是否震动 */
  vibrate: boolean
}

export interface User {
  _openid: string

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

  /** 当前选择的单词书 id */
  bookId: string

  /** 用户配置 */
  config: UserConfig
}

/** 示例数据：{"_id":"BEC_100","rank":100,"word":"tool","bookId":"BEC","usphone":"tul","trans":[{"tranCn":"工具，用具；器械，机床；手段","pos":"n"},{"tranCn":"使用工具；用机床装备工厂","pos":"v"}]} */
export interface Word {
  _id: string
  /** 单词 */
  word: string

  /** 音标 */
  usphone: string

  trans: Array<{
    /** 翻译 */
    tranCn: string

    /** 词性 */
    pos: string
  }>

  /** 所属书籍 */
  bookId: string
  rank: number
}

export interface Book {
  _id: string

  /** 单词书名称，比如：四级核心词 */
  name: string

  /** 单词书缩写，用于首页「单词书」显示，比如：CET4 */
  shortName: string

  /** 单词书封面 */
  image: string

  /** 单词书的单词数目 */
  wordsNumber: number

  /** 单词书选择人数 */
  peopleNumber: number

  /** 单词书排序 */
  sort: number
}

/** 好友对战 | 人机对战 | 随机匹配 */
export type COMBAT_TYPE = 'friend' | 'npc' | 'random'

/** 新创建的房间 | 用户均已准备 | 正在对局中 | 对战过程中有用户离开，对战解散 | 对战结束 */
export type COMBAT_STATE = 'create' | 'ready' | 'start' | 'dismiss' | 'end'

export interface CombatUser {
  /** 当局对战总分数 */
  gradeTotal: number

  records: Array<{

    /** 所选择的选项 index */
    index: number

    /** 选择该题所获得的分数 */
    score: number
  }>

  /** 用户头像 */
  avatar: string

  /** 用户昵称 */
  nickname: string

  /** 用户的 openid */
  _openid: string

  /** 词力值 */
  experience: number

  /** 总对战次数 */
  totalGames: number

  /** 对局胜利次数 */
  winGames: number
}

export interface CombatWord {
  /** 单词 */
  word: string

  /** 单词 id */
  wordId: string

  /** 音标 */
  usphone: string

  /** 释义选项 */
  options: string[]

  /** 正确的释义选项 index */
  correctIndex: number
}

export interface Combat {
  users: CombatUser[]

  book: {
    /** 所 PK 的单词书 id */
    _id: string
    /** 所 pk 的单词书的名称，用于展示 */
    name: string
  }

  wordList: CombatWord[]

  type: COMBAT_TYPE

  state: COMBAT_STATE

  /** 再来一局的房间 id */
  next: string

  /** 对战房间 id */
  _id: string | DB.DocumentId

  /** 房间创建时间 */
  _createTime: DB.ServerDate | string
}
