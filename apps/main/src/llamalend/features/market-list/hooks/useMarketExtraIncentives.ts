import { useMemo } from 'react'
import type { SupplyExtraIncentive } from '@/llamalend/rates.types'
import { formatSupplyExtraIncentives } from '@/llamalend/rates.utils'
import { notFalsy } from '@primitives/objects.utils'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'

export const useMarketExtraIncentives = (
  type: MarketRateType,
  incentives: ExtraIncentive[],
  baseRate: number | null | undefined,
  userBoost?: number | null | undefined,
): SupplyExtraIncentive[] =>
  useMemo(
    () =>
      notFalsy(
        type === MarketRateType.Supply && formatSupplyExtraIncentives({ incentives, baseRate, userBoost }),
      ).flat(),
    [baseRate, incentives, type, userBoost],
  )
