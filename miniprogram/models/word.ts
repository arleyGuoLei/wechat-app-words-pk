import Base from './base'

class WordModel extends Base {
  static $collection = 'word'

  constructor () {
    super(WordModel)
  }
}

export default new WordModel()
