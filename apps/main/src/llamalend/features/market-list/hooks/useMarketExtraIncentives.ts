import { useMemo } from 'react'
import { formatSupplyExtraIncentives } from '@/llamalend/rates.utils'
import { ExtraIncentive, MarketRateType } from '@evm-ui/types/market'
import { notFalsyArray } from '@primitives/objects.utils'

export const useMarketExtraIncentives = (
  type: MarketRateType,
  incentives: ExtraIncentive[],
  baseRate: number | null | undefined,
): ExtraIncentive[] =>
  useMemo(
    () => notFalsyArray(type === MarketRateType.Supply && formatSupplyExtraIncentives({ incentives, baseRate })),
    [baseRate, incentives, type],
  )
