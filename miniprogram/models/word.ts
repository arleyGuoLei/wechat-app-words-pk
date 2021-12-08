import Base from './base'

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

class WordModel extends Base {
  static $collection = 'word'

  constructor () {
    super(WordModel)
  }
}

export default new WordModel()
