import combatModel from './../../../../models/combat'
import userModel from './../../../../models/user'
import { store, IAppOption } from './../../../../app'
import { COMBAT_TYPE } from './../../../../../typings/model'
import { getUserInfo, formatCombatInfo } from './../../../../utils/helper'
import { throttle, loading, sleep } from './../../../../utils/util'

const app = getApp<IAppOption>()

App.Component({
  properties: {
    isShareResult: {
      type: Boolean,
      value: false
    }
  },
  data: {
    leftIncExperience: 0,
    rightIncExperience: 0
  },
  options: {
    addGlobalClass: true
  },
  lifetimes: {
    ready () {
      if (!this.data.isShareResult) {
        void this.onSettle()
      }
    }
  },
  methods: {
    /**
     * 进行对战结算
     * - 房主修改房间状态为 end
     * - 各自增加自己的词力值
     */
    async onSettle () {
      const { isOwner, _id, users } = store.$state.combat!
      const incExperience = this.getIncExperience()
      isOwner && combatModel.end(_id)

      // NOTE: 对战结算出现 users 长度 < 2 的情况，可能是用户逃离、异常，做兜底处理
      const otherUserGradeTotal = (users.length > 1 && users[1].gradeTotal) ? users[1].gradeTotal : 0
      const isWin = isOwner ? users[0]?.gradeTotal >= otherUserGradeTotal : otherUserGradeTotal >= users[0]?.gradeTotal

      // NOTE: 云端增加词力值
      await userModel.incExperience(incExperience, isWin)

      // NOTE: 本地增加词力值
      store.setState({
        user: {
          ...store.$state.user,
          experience: store.$state.user.experience + incExperience,
          winGames: store.$state.user.winGames + (isWin ? 1 : 0),
          totalGames: store.$state.user.totalGames + 1
        }
      })
    },
    /**
     * 获取需要增加的词力值，计算规则为 向下取整 (本局分数 / 50)，返回自己需要增加的词力值
     */
    getIncExperience () {
      const { users, isOwner } = store.$state.combat!

      // NOTE: 页面切换时，ready 安卓端偶现重新执行，当数据不存在的时候这里做一下拦截
      if (!users ||
        users.length < 2 ||
        !users[0]._openid ||
        !users[1]._openid
      ) { return 0 }

      const left = Math.floor(users[0].gradeTotal / 50)
      const right = Math.floor(users[1].gradeTotal / 50)

      const leftIncExperience = left > 0 ? left : 0
      const rightIncExperience = right > 0 ? right : 0

      this.setData({ leftIncExperience, rightIncExperience })

      return isOwner ? left : right
    },
    onCreateCombat: throttle(async function (this: {createCombat: (combatType: COMBAT_TYPE) => Promise<void>, triggerEvent: WechatMiniprogram.Component.InstanceMethods<{}>['triggerEvent'], data: {isShareResult: boolean}}) {
      const { isOwner, _id, type } = store.$state.combat!
      const isShareResult = this.data.isShareResult

      // fix: 修复对战结束后的随机匹配再来一局
      // 分享的房间点击再来一局 或 房主点击再来一局，好友对战将创建一个好友对战的房间，随机匹配和人机统一创建一局随机对战
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (isShareResult || isOwner || type === 'random') {
        // 结束本局的数据变更监听
        this.triggerEvent('onCloseWatcher')
        loading.show('创建中')

        // 等待一会儿，确保上一局已经断开连接
        await sleep(200)

        const userinfo = await getUserInfo()
        const book = store.getState().book

        if (type === 'friend') {
          const combatInfo = formatCombatInfo(userinfo, book, 'friend', new Array(+userinfo.config.combatQuestionNumber).fill({}))

          const otherParame = isShareResult ? {} : { previousId: _id }
          await app.routes.pages.combat.redirectTo({ type: 'friend', state: 'create', ...otherParame }) // 注意跳转方式为 redirectTo，并且非分享战绩结果的房间需要携带上房间 id

          // ↑ 跳转页面后有一个异步的初始化请求，↓ 的数据更新测试是在异步初始化 watch 之前，所以能在 redirectTo 后执行
          store.setState({
            combat: { ...combatInfo, state: 'create', next: '', _id: '', _createTime: '', isOwner: true }
          })
        } else {
          const combatInfo = formatCombatInfo(userinfo, book, 'random', new Array(+userinfo.config.combatQuestionNumber).fill({}))

          void app.routes.pages.combat.redirectTo({ type: 'random' })

          store.setState({ combat: { ...combatInfo, state: 'lock', next: '', _id: '', _createTime: '', isOwner: true } })
        }

        loading.hide()
      } else { // 加入上一局房主创建的房间
        // 结束本局的数据变更监听
        this.triggerEvent('onCloseWatcher')
        loading.show('加入中')

        await sleep(200)

        const { next } = store.$state.combat!

        // NOTE: 数据变更转场较快，同页面刷新可能闪动，故增加加载态 + 跳转前清空本页数据
        store.setState({ combat: null })

        wx.nextTick(async () => {
          // path: `/pages/combat/combat?id=${String(_id)}&type=friend&state=ready`
          await app.routes.pages.combat.redirectTo({ type: 'friend', state: 'ready', id: next }) // 注意跳转方式为 redirectTo
          loading.hide()
        })
      }
    }, 500),
    onGoHome () {
      void app.routes.pages.home.redirectTo({})
    }
  }
})
