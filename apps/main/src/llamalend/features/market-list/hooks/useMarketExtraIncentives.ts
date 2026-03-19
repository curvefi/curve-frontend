import { useMemo } from 'react'
import type { ExtraIncentiveItem } from '@/llamalend/widgets/tooltips/RewardTooltipItems'
import { notFalsy } from '@primitives/objects.utils'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'
import { Chain, CRV_ADDRESS, defaultNumberFormatter } from '@ui-kit/utils'

const address = CRV_ADDRESS[Chain.Ethereum]
const blockchainId = 'ethereum' as const

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
            minApr && { title: 'CRV', percentage: minApr, address, blockchainId, isBoost: false },
            userBoost &&
              minApr &&
              userBoost > 1 && {
                title: `Your boost (${defaultNumberFormatter(userBoost)}x)`,
                percentage: minApr * userBoost - minApr,
                address,
                blockchainId,
                isBoost: true,
              },
            ...incentives.map((incentive) => incentive.percentage > 0 && { ...incentive, isBoost: false }),
          )
        : [],
    [incentives, minApr, type, userBoost],
  )
