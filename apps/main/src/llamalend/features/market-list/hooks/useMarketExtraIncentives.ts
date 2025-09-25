import { useMemo } from 'react'
import type { ExtraIncentiveItem } from '@/llamalend/widgets/tooltips/RewardTooltipItems'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'
import { CRV_ADDRESS, defaultNumberFormatter, fromPrecise, type PreciseNumber } from '@ui-kit/utils'

export const useMarketExtraIncentives = (
  type: MarketRateType,
  incentives: ExtraIncentive[],
  minApr: PreciseNumber | null | undefined,
  userBoost?: PreciseNumber | null | undefined,
): ExtraIncentiveItem[] =>
  useMemo(
    () =>
      type === MarketRateType.Supply
        ? notFalsy(
            minApr && {
              title: 'CRV',
              percentage: fromPrecise(minApr),
              address: CRV_ADDRESS,
              blockchainId: 'ethereum',
              isBoost: false,
            },
            userBoost &&
              minApr &&
              fromPrecise(userBoost) > 1 && {
                title: `Your boost (${defaultNumberFormatter(userBoost)}x)`,
                percentage: fromPrecise(minApr) * fromPrecise(userBoost) - fromPrecise(minApr),
                address: CRV_ADDRESS,
                blockchainId: 'ethereum',
                isBoost: true,
              },
            ...incentives.map((incentive) => incentive.percentage > 0 && { ...incentive, isBoost: false }),
          )
        : [],
    [incentives, minApr, type, userBoost],
  )
