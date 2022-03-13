export default {
  cloudEnv: {
    develop: '__DEVELOP_ENV__',
    release: '__RELEASE_ENV__'
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
  combatRandomMaxTime: 2 * 60 * 1000,

  /** 随机匹配在等待了的情况下，如果多久房主没开始对战，可认为房间异常，房主掉线，则再次重新加入新房间，单位 ms */
  randomReadyWaiting: 5000,

  /** 匹配成功等待多久开始对战，基于开始时间做计算，单位 ms */
  randomStartWaiting: 1500,

  /** 人机最快的选择时间，单位 ms */
  minNPCSelectTime: 2000,

  /** 人机对战随机增加的时间间隔，单位 ms，最终选择时间由 minNPCSelectTime + (0 ~ NPCSelectMaxGap) */
  NPCSelectMaxGap: 1000,

  /** 人机对战当前用户选择后多久进行人机的选择 (如果还没选择的话才会调用到人机选择逻辑) */
  NPCSelectDelay: 200,

  /** 人机模式正确率，例如：75%，则设置为 0.75 */
  NPCCorrectRate: 0.75,

  /** 对战模式分享战绩赠送的提示卡数目 */
  combatShareAddTotalTip: 5,

  /** 每日词汇每次加载的词汇数目 */
  learningPageSize: 20,

  /** 每日词汇每道题目的选项数目 */
  learningOptionNumber: 4,

  /** 每日词汇每局的默认生命值 */
  learningHealthPoint: 3,

  /** 每日词汇每题的倒计时，单位 s */
  learningCountDown: 30,

  /** 每日词汇剩余多少题目没回答时进行下页题目的预请求加载 */
  learningWordsSurplusPreload: 5,

  /** 对战设置每局的对战单词数目 */
  combatQuestionNumbers: [8, 10, 12, 15, 20, 30]
}
