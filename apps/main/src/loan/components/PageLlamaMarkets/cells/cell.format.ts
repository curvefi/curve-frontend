import { LlamaMarketType } from '@/loan/entities/llama-markets'
import type { RewardsAction } from '@ui/CampaignRewards/types'

export const formatPercent = (rate: number) => `${rate.toPrecision(4)}%`

export const getRewardsAction = (marketType: LlamaMarketType, type: 'borrow' | 'lend'): RewardsAction =>
  marketType === LlamaMarketType.Mint ? 'loan' : type == 'borrow' ? 'borrow' : 'supply'
