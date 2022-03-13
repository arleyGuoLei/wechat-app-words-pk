import { sleep, chunk } from './util'
import config from './config'
import type { UserInfoState, BookState } from './state'
import { store } from './../app'
import userModel from './../models/user'
import { Word, CombatWord, COMBAT_TYPE, Combat, CombatUser } from './../../typings/model'

export const DEFAULT_USER_INFO = {
  avatarUrl: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5988d11f-2178-4757-82ed-80342d2c8132/9e28e36a-84e3-499f-901b-4e7e8f6b923d.png',
  city: '',
  country: 'China',
  gender: 1,
  language: 'zh_CN',
  nickName: '单词天天斗',
  province: ''
}

/**
 * 获取当前用户的用户信息，如果从 getUserProfile 获取，将会更新数据库数据
 * @param getUserProfile 是否强制使用 getUserProfile 从微信获取最新的用户信息
 */
export const getUserInfo = async (getUserProfile = false): Promise<UserInfoState> => {
  const user = store.getState().user
  // NOTE: IOS 上可能出现首页加载态未显示，在没登录的情况下，不能创建房间，因为获取不到用户的配置信息，所以在这里做了拦截
  if (!user._openid) {
    void wx.showToast({ title: '数据加载中，请重试 ...', icon: 'none', duration: 2000 })
    throw new Error('not login')
  }

  // 1. 使用数据库存储的数据，即 state 中的 user 数据
  let baseUserInfo = { avatar: user.avatar, nickname: user.nickname }

  if (!baseUserInfo.avatar ||
    !baseUserInfo.nickname ||
    baseUserInfo.avatar === DEFAULT_USER_INFO.avatarUrl ||
    baseUserInfo.nickname === DEFAULT_USER_INFO.nickName ||
    getUserProfile) {
    try {
      // 2. 调用 wx.getUserProfile 获取数据
      const { userInfo } = await wx.getUserProfile({ desc: '将用于对战信息显示' })
      const { avatarUrl, nickName } = userInfo
      baseUserInfo = { avatar: avatarUrl, nickname: nickName }
    } catch (error) {
      // 3. 获取失败则使用匿名默认数据，注意：匿名数据同时也会存入数据库
      baseUserInfo = { avatar: DEFAULT_USER_INFO.avatarUrl, nickname: DEFAULT_USER_INFO.nickName }
      const duration = 1200
      void wx.showToast({
        title: '获取用户信息失败, 将使用匿名信息',
        icon: 'none',
        duration
      })
      await sleep(duration)
    }
    const newUser = { ...user, ...baseUserInfo }
    void userModel.updateUserInfo(newUser)
    store.setState({ user: newUser })
  }

  return {
    ...user,
    ...baseUserInfo
  }
}

/**
 * 随机单词列表转成符合对战选词的列表
 * @param {array} list 随机单词列表
 * @param {number} len 每一个题目有多少个选项
 */
export const formatWordList = (list: Word[], len: number): CombatWord[] => {
  const lists = chunk(list, len)
  return lists.map(words => {
    const question: CombatWord = {
      options: [],
      correctIndex: -1,
      word: '',
      wordId: '',
      usphone: ''
    }

    // 随机生成一个 correctIndex 作为 options 中的答案索引
    const correctIndex = Math.floor(Math.random() * len)

    words.forEach((word, index) => {
      if (index === correctIndex) {
        question.correctIndex = correctIndex
        question.word = word.word
        question.wordId = word._id
        question.usphone = word.usphone
      }

      // 对于有多个释义的单词，随机取一个释义
      const { pos, tranCn } = word.trans.sort(() => Math.random() - 0.5)[0]
      let trans = tranCn
      if (pos) {
        trans = `${pos}.${tranCn}` // 如果有词性，则拼接词性
      }

      question.options.push(trans)
    })
    return question
  })
}

export const formatCombatUser = (user: Pick<UserInfoState, 'avatar' | 'nickname' | '_openid' | 'experience' | 'totalGames' | 'winGames'>): CombatUser => {
  return {
    gradeTotal: 0,
    records: {},
    avatar: user.avatar,
    nickname: user.nickname,
    _openid: user._openid,
    experience: user.experience,
    totalGames: user.totalGames,
    winGames: user.winGames
  }
}

export const formatCombatInfo = (user: UserInfoState, book: BookState, type: COMBAT_TYPE, wordList: CombatWord[]): Pick<Combat, 'users' | 'book' | 'wordList' | 'type'> => {
  const combatInfo = {
    users: [formatCombatUser(user)],
    book: {
      _id: book._id,
      name: book.name,
      shortName: book.shortName
    },
    wordList,
    type
  }

  return combatInfo
}

/**
 * 获取答题获得分数，由当前时间和本题开始时间进行计算
 * @param startTime 本题开始时间
 */
export const getCombatSelectScore = (startTime: number): number => {
  // 每道题满分 100 分，选择越快分数越高
  // score = -10 * (x) + 100
  const totalMilliSecond = config.combatCountDown * 1000
  const timeConsuming = Date.now() - startTime // 答题耗时

  const score = Math.ceil(-10 * (timeConsuming / (totalMilliSecond / 10)) + 100)

  if (score >= 100) { return 100 }
  if (score <= 1) { return 1 }
  return score
}
