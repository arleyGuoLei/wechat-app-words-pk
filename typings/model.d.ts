export interface User {
  _openid?: string

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
