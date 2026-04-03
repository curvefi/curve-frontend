import { useMemo } from 'react'
import type { ExtraIncentiveItem } from '@/llamalend/widgets/tooltips/RewardTooltipItems'
import { notFalsy } from '@primitives/objects.utils'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'
import { MAINNET_CRV_ADDRESS, defaultNumberFormatter } from '@ui-kit/utils'

export const useMarketExtraIncentives = (
  type: MarketRateType,
  incentives: ExtraIncentive[],
  baseRate: number | null | undefined,
  userBoost?: number | null | undefined,
): ExtraIncentiveItem[] =>
  useMemo(
    () =>
      type === MarketRateType.Supply
        ? notFalsy(
            baseRate && {
              title: 'CRV',
              percentage: baseRate,
              address: MAINNET_CRV_ADDRESS,
              blockchainId: 'ethereum',
              isBoost: false,
            },
            userBoost &&
              baseRate &&
              userBoost > 1 && {
                title: `Your boost (${defaultNumberFormatter(userBoost)}x)`,
                percentage: baseRate * userBoost - baseRate,
                address: MAINNET_CRV_ADDRESS,
                blockchainId: 'ethereum',
                isBoost: true,
              },
            ...incentives.map((incentive) => incentive.percentage > 0 && { ...incentive, isBoost: false }),
          )
        : [],
    [baseRate, incentives, type, userBoost],
  )
