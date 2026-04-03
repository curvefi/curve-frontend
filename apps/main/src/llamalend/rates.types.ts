import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import type { ExtraIncentive } from '@ui-kit/types/market'
import type { AverageCategory } from '@ui-kit/utils'

export type BorrowRate = {
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageCategory: AverageCategory
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}

export type SupplyRate = {
  supplyApy: number | null | undefined
  averageLendApy: number | null | undefined
  averageCategory: AverageCategory
  supplyApyCrvMinBoost: number | null | undefined
  supplyApyCrvMaxBoost: number | null | undefined
  averageApyCrvMinBoost: number | null | undefined
  averageApyCrvMaxBoost: number | null | undefined
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  totalMinBoost: number | null | undefined
  totalMaxBoost: number | null | undefined
  totalAverageMinBoost: number | null | undefined
  totalAverageMaxBoost: number | null | undefined
  extraIncentives: ExtraIncentive[]
  extraIncentivesTotalApy: number | null | undefined
  averageExtraIncentivesApy: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
