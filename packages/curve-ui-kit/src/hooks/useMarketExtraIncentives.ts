import { useMemo } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import type { MarketRateType, ExtraIncentive } from '@ui-kit/types/market'

const CRV_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52'

export const useMarketExtraIncentives = (
  type: MarketRateType,
  incentives: ExtraIncentive[],
  boostedApr: number | null | undefined,
) =>
  useMemo(() => {
    if (type !== 'supply') return []

    return notFalsy(
      boostedApr && {
        title: 'CRV',
        percentage: boostedApr,
        address: CRV_ADDRESS,
        blockchainId: 'ethereum',
      },
      ...incentives.map((incentive) => incentive.percentage > 0 && incentive),
    )
  }, [incentives, boostedApr, type])
