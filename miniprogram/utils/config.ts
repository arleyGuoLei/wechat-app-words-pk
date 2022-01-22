export default {
  cloudEnv: {
    develop: 'cloud1-2gxt3f0qb7420723',
    release: 'release-5g3qji4cea00e725'
  },
  /** 对战模式每道题目的选项数目 */
  combatOptionNumber: 4,
  defaultShare: {
    title: '❤ 来一起学习吧，轻松掌握【四六级/考研】必考单词 ~ 👏👏',
    path: '/pages/home/home',
    imageUrl: './../../images/share-default-bg.png'
  },
  audios: {
    selectCorrect: 'audios/correct.mp3',
    selectWrong: 'audios/wrong.mp3'
  },
  /** 对战模式倒计时时间，单位 s */
  combatCountDown: 10,
  /** 对战回答错误扣分 */
  combatWrongDeduction: -10,
  /** 双方都选择完之后，等待多少毫秒切换下一题 */
  combatNextWordWaiting: 1100,
  /** 对战倒计时结束多久另外用户没有选择判定用户已退出，结束对战，单位 ms，例如倒计时 5s 后如果另外一个用户没选择，则判定为连接超时，结束对战 */
  combatSelectTimeout: 5000,

  /** 随机匹配最多等待多久 (超时则开启人机对战)，单位 ms */
  combatRandomMaxTime: 2 * 60 * 1000
}
