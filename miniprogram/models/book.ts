import Base from './base'
import type { Book } from './../../typings/model'
import type { DB } from 'typings/types/wx/wx-server-sdk'

class BookModel extends Base {
  static $collection = 'book'

  constructor () {
    super(BookModel)
  }

  async getTotal (): Promise<number> {
    const { total } = (await this.model.count()) as DB.ICountResult
    return total
  }

  async getList (page: number): Promise<Book[]> {
    const size = 5 // 每页包含多少条

    const { data: books } = (await this.model
      .orderBy('sort', 'asc')
      .skip((page - 1) * size)
      .limit(size)
      .get()) as DB.IQueryResult

    return books as Book[]
  }
}

export default new BookModel()
