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
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageRateLabel: string
  supplyAprCrvMinBoost: number | null | undefined
  supplyAprCrvMaxBoost: number | null | undefined
  averageSupplyAprCrvMinBoost: number | null | undefined
  averageSupplyAprCrvMaxBoost: number | null | undefined
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  totalSupplyRateMinBoost: number | null | undefined
  totalSupplyRateMaxBoost: number | null | undefined
  totalAverageSupplyRateMinBoost: number | null | undefined
  totalAverageSupplyRateMaxBoost: number | null | undefined
  extraIncentives: ExtraIncentive[]
  averageTotalExtraIncentivesApr: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}

export type AvailableLiquidity = {
  value: number | null | undefined
  max: number | null | undefined
  loading: boolean
}

export type PageHeaderData = {
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
}
