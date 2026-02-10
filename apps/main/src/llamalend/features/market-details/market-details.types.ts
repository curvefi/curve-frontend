import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { LlamaMarketType, type ExtraIncentive } from '@ui-kit/types/market'

export type Collateral = {
  total: number | undefined | null
  totalUsdValue: number | undefined | null
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  usdRate: number | undefined | null
  loading: boolean
}
export type BorrowRate = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  // total = rate - rebasingYield
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
export type SupplyRate = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  supplyAprCrvMinBoost: number | undefined | null
  supplyAprCrvMaxBoost: number | undefined | null
  averageSupplyAprCrvMinBoost: number | undefined | null
  averageSupplyAprCrvMaxBoost: number | undefined | null
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  // total = rate - rebasingYield + combined extra incentives + boosted (min or max) yield
  totalSupplyRateMinBoost: number | null | undefined
  totalSupplyRateMaxBoost: number | null | undefined
  totalAverageSupplyRateMinBoost: number | null | undefined
  totalAverageSupplyRateMaxBoost: number | null | undefined
  extraIncentives: ExtraIncentive[]
  averageTotalExtraIncentivesApr: number | undefined | null
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
export type BorrowToken = {
  total?: number | undefined | null
  totalUsdValue?: number | undefined | null
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  usdRate: number | undefined | null
  loading: boolean
}
export type AvailableLiquidity = {
  value: number | undefined | null
  max: number | undefined | null
  loading: boolean
}
export type MaxLeverage = {
  value: number | undefined | null
  loading: boolean
}

export type MarketDetailsProps = {
  collateral: Collateral
  borrowToken?: BorrowToken
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
  maxLeverage?: MaxLeverage
  blockchainId: string
  marketType: LlamaMarketType
}
