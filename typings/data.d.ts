import { Word } from './model'

export interface IUserWords {
  nextPage: number | null
  list: Word[]
}

interface IExperienceRankingItem {
  avatar: string
  nickname: string
  experience: number
  /** 排名 */
  index: number
}

export interface IExperienceRanking {
  mine: IExperienceRankingItem
  list: IExperienceRankingItem[]
}

interface ILearningRankingItem {
  avatar: string
  nickname: string
  learning: {
    maxScore: number
    bookShortName: string
  }

  /** 排名 */
  index: number
}

export interface ILearningRanking {
  mine: ILearningRankingItem
  list: ILearningRankingItem[]
}

export type IRankingType = 'experience'| 'learning'
