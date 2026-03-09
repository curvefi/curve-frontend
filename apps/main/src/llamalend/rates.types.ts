import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import type { ExtraIncentive } from '@ui-kit/types/market'

export type BorrowRate = {
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageRateLabel: string
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
  averageRateLabel: string
  supplyAprCrvMinBoost: number | null | undefined
  supplyAprCrvMaxBoost: number | null | undefined
  averageAprCrvMinBoost: number | null | undefined
  averageAprCrvMaxBoost: number | null | undefined
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  totalMinBoost: number | null | undefined
  totalMaxBoost: number | null | undefined
  totalAverageMinBoost: number | null | undefined
  totalAverageMaxBoost: number | null | undefined
  extraIncentives: ExtraIncentive[]
  extraIncentivesTotalApr: number | null | undefined
  averageExtraIncentivesApr: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
