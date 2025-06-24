import type { RateType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { LlamaMarketType } from '@/loan/entities/llama-markets'
import type { RewardsAction } from '@ui/CampaignRewards/types'

/**
 * Formats a rate as a percentage string with 4 significant digits.
 * @param rate - The rate to format, when null, it defaults to 0 (please do not display this, show Skeleton instead).
 */
export const formatPercent = (rate: number | null) => `${(rate || 0).toPrecision(4)}%`
export const formatPercentFixed = (rate: number) => `${rate.toFixed(2)}%`

export const getRewardsAction = (marketType: LlamaMarketType, type: RateType): RewardsAction =>
  type == 'borrow' ? (marketType === LlamaMarketType.Mint ? 'loan' : 'borrow') : 'supply'
