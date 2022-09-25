import { store, events } from './../../../../app'
import { formatCombatUser, getCombatSelectScore } from './../../../../utils/helper'
import { loading } from './../../../../utils/util'
import config from './../../../../utils/config'
import KvModel, { INPC } from './../../../../models/kv'
import combatModel from './../../../../models/combat'

const TIMER_NULL = -1

// NOTE: FIX 人机多次选择 2022-09-25
/** npc 自动选择器 */
let npcSelectTimer = TIMER_NULL

App.Component({
  data: {
    /** 人机是否已经选择，false 为未选 */
    npcSelected: false,

    /** 当前题目开始时间，用于选择时做分数计算，该值和 pkScene 中的 countDownStartTime 一致 */
    startTime: 0,

    npcInfo: {}
  },
  lifetimes: {
    ready () {
      events.on('startNPCCombat', this.onStartNPCCombat.bind(this))
      events.on('npcSelect', this.npcSelect.bind(this))
      events.on('autoNPCSelect', this.autoNPCSelect.bind(this))
    },
    detached () {
      events.off('startNPCCombat')
      events.off('npcSelect')
      events.off('autoNPCSelect')
    }
  },
  methods: {
    /** 每题初始化时，会自动调用该函数 */
    autoNPCSelect () {
      this.data.npcSelected = false
      this.data.startTime = Date.now()

      npcSelectTimer = setTimeout(() => {
        void this.npcSelect()
      }, config.minNPCSelectTime + config.NPCSelectMaxGap * Math.random())
    },
    async npcSelect () {
      if (!this.data.npcSelected) {
        clearTimeout(npcSelectTimer)
        this.data.npcSelected = true

        const id = store.$state.combat?._id as DB.DocumentId
        const wordsIndex = store.$state.combat?.wordsIndex!
        const wordList = store.$state.combat?.wordList!
        const correctIndex = wordList[wordsIndex]?.correctIndex ?? -1 // 某些条件下报错 Cannot read property 'correctIndex' of undefined，当找不到时认为选择错误
        const index = correctIndex === -1 ? correctIndex : ((Math.random() > config.NPCCorrectRate) ? (config.combatOptionNumber - 1 - correctIndex) : correctIndex) // NPCCorrectRate * 100%的概率正确, 其他选择错误答案(3-correctIndex)
        const npcInfo = this.data.npcInfo as INPC

        const score = index === correctIndex ? getCombatSelectScore(this.data.startTime) : config.combatWrongDeduction

        const isSelect = await combatModel.selectOption(id, index, score, wordsIndex, 1, npcInfo._openid)

        // NOTE: 选择失败，进行重试
        if (!isSelect) {
          this.data.npcSelected = false
          void this.npcSelect()
          return
        }
        this.data.npcSelected = true
      }
    },
    async onStartNPCCombat () {
      const fail = (title: string): void => {
        loading.hide()
        void wx.showToast({ title, icon: 'none', duration: 1200 })
      }
      const { state, _id } = store.$state.combat!
      if (state !== 'create') {
        void wx.showToast({ title: '数据加载中 ...', icon: 'none', duration: 900 })
        return
      }
      loading.show('准备开始对战 ...')
      const npc = await this.getOneNpc()

      if (!npc) {
        return fail('人机数据获取失败, 请重试')
      }

      const isJoin = await combatModel.ready(_id, formatCombatUser({
        ...npc,
        experience: 0,
        totalGames: 0,
        winGames: 0
      }), 'npc')

      if (!isJoin) {
        return fail('人机对战开始失败，请重试')
      }

      this.setData({ npcInfo: npc })
      loading.hide()
    },
    async getOneNpc () {
      const npcData = await KvModel.getData('npc')
      if (npcData) {
        // NOTE: 随机取所有人机数据中的一个
        const index = Math.floor(Math.random() * npcData.length)
        return npcData[index]
      }

      return null
    }
  }
})
