import Base from './base'

class BookModel extends Base {
  static $collection = 'book'

  constructor () {
    super(BookModel)
  }
}

export default new BookModel()
