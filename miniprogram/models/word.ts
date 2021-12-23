import Base from './base'
import type { Word } from './../../typings/model'

/**
 * 所有用户可读
 */
class WordModel extends Base {
  static $collection = 'word'

  constructor () {
    super(WordModel)
  }

  /**
   * 从指定单词书获取 size 数目的随机单词
   * @param bookId 所需要获取的单词书 id
   * @param size 需要获取的单词数目
   */
  async getRandomWords (bookId: string, size: number): Promise<Word[]> {
    const where = bookId === 'random' ? {} : { bookId }
    try {
      // NOTE: 可以通过 .sample({ size }) 获取随机数据
      const res = await this.model.aggregate()
        .match(where)
        .limit(999999)
        .sample({ size })
        .end()
      if (res) {
        return res.list
      }

      throw new Error('get getRandomWords list error')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export default new WordModel()
