import { useMemo } from 'react'
import type { ExtraIncentiveItem } from '@/llamalend/widgets/tooltips/RewardTooltipItems'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'
import { defaultNumberFormatter } from '@ui-kit/utils'

const CRV_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52'

export const useMarketExtraIncentives = (
  type: MarketRateType,
  incentives: ExtraIncentive[],
  minApr: number | null | undefined,
  userBoost?: number | null | undefined,
): ExtraIncentiveItem[] =>
  useMemo(
    () =>
      type === MarketRateType.Supply
        ? notFalsy(
            minApr && {
              title: 'CRV',
              percentage: minApr,
              address: CRV_ADDRESS,
              blockchainId: 'ethereum',
              isBoost: false,
            },
            userBoost &&
              minApr &&
              userBoost > 1 && {
                title: `Your boost (${defaultNumberFormatter(userBoost)}x)`,
                percentage: minApr * userBoost - minApr,
                address: CRV_ADDRESS,
                blockchainId: 'ethereum',
                isBoost: true,
              },
            ...incentives.map((incentive) => incentive.percentage > 0 && { ...incentive, isBoost: false }),
          )
        : [],
    [incentives, minApr, type, userBoost],
  )
