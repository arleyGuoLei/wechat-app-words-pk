import Base from './base'

export interface Book {
  _id: string

  /** 单词书名称，比如：四级核心词 */
  name: string

  /** 单词书缩写，用于首页「单词书」显示，比如：CET4 */
  shortName: string

  /** 单词书封面 */
  image: string
}

class BookModel extends Base {
  static $collection = 'book'

  constructor () {
    super(BookModel)
  }
}

export default new BookModel()
