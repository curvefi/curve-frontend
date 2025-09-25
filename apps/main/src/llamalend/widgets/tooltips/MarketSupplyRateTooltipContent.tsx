import { useMarketExtraIncentives } from '@/llamalend/features/market-list/hooks/useMarketExtraIncentives'
import { formatPercent } from '@/llamalend/format.utils'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import type { PoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { ExtraIncentive, MarketRateType } from '@ui-kit/types/market'
import { fromPrecise, PreciseNumber } from '@ui-kit/utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketSupplyRateTooltipContentProps = {
  supplyRate: PreciseNumber | null | undefined
  averageRate: PreciseNumber | null | undefined
  periodLabel: string
  extraRewards: PoolRewards[]
  extraIncentives: ExtraIncentive[]
  minBoostApr: PreciseNumber | null | undefined
  maxBoostApr: PreciseNumber | null | undefined
  userBoost?: PreciseNumber | null | undefined
  userTotalCurrentSupplyApr?: PreciseNumber | null | undefined
  totalSupplyRateMinBoost: PreciseNumber | null | undefined
  totalSupplyRateMaxBoost: PreciseNumber | null | undefined
  totalAverageSupplyRateMinBoost: PreciseNumber | null | undefined
  totalAverageSupplyRateMaxBoost: PreciseNumber | null | undefined
  rebasingYield: PreciseNumber | null | undefined
  rebasingSymbol?: string | null | undefined
  isLoading: boolean
}

export const MarketSupplyRateTooltipContent = ({
  supplyRate,
  averageRate,
  periodLabel,
  extraRewards,
  extraIncentives,
  minBoostApr,
  maxBoostApr,
  userBoost,
  userTotalCurrentSupplyApr,
  totalSupplyRateMinBoost,
  totalSupplyRateMaxBoost,
  totalAverageSupplyRateMinBoost,
  totalAverageSupplyRateMaxBoost,
  rebasingYield,
  rebasingSymbol,
  isLoading,
}: MarketSupplyRateTooltipContentProps) => {
  const extraIncentivesFormatted = useMarketExtraIncentives(
    MarketRateType.Supply,
    extraIncentives,
    minBoostApr,
    userBoost,
  )

  return (
    <TooltipWrapper>
      <TooltipDescription text={t`The supply yield is the estimated earnings related to your share of the pool. `} />
      <TooltipDescription text={t`It varies according to the market and the monetary policy.`} />
      {!!rebasingYield && (
        <TooltipDescription text={t`The collateral of this market is yield bearing and offer extra yield.`} />
      )}
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Supply rate`}>{formatPercent(supplyRate)}</TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {averageRate ? formatPercent(averageRate) : 'N/A'}
          </TooltipItem>
        </TooltipItems>
        {!!rebasingYield && rebasingSymbol && (
          <TooltipItems secondary>
            <TooltipItem variant="subItem" title={rebasingSymbol}>
              {formatPercent(rebasingYield)}
            </TooltipItem>
          </TooltipItems>
        )}
        {extraRewards.length + extraIncentivesFormatted.length > 0 && (
          <TooltipItems secondary>
            <RewardsTooltipItems
              title={t`Staking incentives`}
              tooltipType={'supply'}
              extraRewards={extraRewards}
              extraIncentives={extraIncentivesFormatted}
            />
          </TooltipItems>
        )}
        {(rebasingYield ||
          extraRewards.length + extraIncentivesFormatted.length > 0 ||
          !!userTotalCurrentSupplyApr ||
          !!minBoostApr ||
          !!maxBoostApr) && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Total APR`}>
              {formatPercent(userTotalCurrentSupplyApr ?? totalSupplyRateMinBoost)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {/* We don't have historical boost values to calculate an average boosted CRV apr for a user, so we have to use the average min boost value */}
              {totalAverageSupplyRateMinBoost ? formatPercent(totalAverageSupplyRateMinBoost) : 'N/A'}
            </TooltipItem>
          </TooltipItems>
        )}
        {fromPrecise(maxBoostApr ?? 0) > 0 && (
          <TooltipItems secondary extraMargin>
            <TooltipItem title={t`Max veCRV Boost (2.5x)`}>{formatPercent(maxBoostApr)}</TooltipItem>
          </TooltipItems>
        )}
        {fromPrecise(maxBoostApr ?? 0) > 0 && (
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={`${t`Total max boosted APR`}`}>
              {formatPercent(totalSupplyRateMaxBoost)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {totalAverageSupplyRateMaxBoost ? formatPercent(totalAverageSupplyRateMaxBoost) : 'N/A'}
            </TooltipItem>
          </TooltipItems>
        )}
      </Stack>
    </TooltipWrapper>
  )
}
