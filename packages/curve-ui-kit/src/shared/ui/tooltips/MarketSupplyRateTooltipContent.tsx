import Stack from '@mui/material/Stack'
import type { PoolRewards } from '@ui-kit/entities/campaigns'
import { useMarketExtraIncentives } from '@ui-kit/hooks/useMarketExtraIncentives'
import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'
import { MarketRateType } from '@ui-kit/types/market'
import { type ExtraIncentiveItem, RewardsTooltipItems } from './RewardTooltipItems'
import { formatPercent } from './utils'

export type MarketSupplyRateTooltipContentProps = {
  supplyRate: number | null | undefined
  averageRate: number | null | undefined
  periodLabel: string
  extraRewards: PoolRewards[]
  extraIncentives: ExtraIncentiveItem[]
  minBoostApr: number | null | undefined
  maxBoostApr: number | null | undefined
  totalSupplyRateMinBoost: number | null | undefined
  totalSupplyRateMaxBoost: number | null | undefined
  totalAverageSupplyRateMinBoost: number | null | undefined
  totalAverageSupplyRateMaxBoost: number | null | undefined
  rebasingYield: number | null | undefined
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
  totalSupplyRateMinBoost,
  totalSupplyRateMaxBoost,
  totalAverageSupplyRateMinBoost,
  totalAverageSupplyRateMaxBoost,
  rebasingYield,
  rebasingSymbol,
  isLoading,
}: MarketSupplyRateTooltipContentProps) => {
  const extraIncentivesFormatted = useMarketExtraIncentives(MarketRateType.Supply, extraIncentives, minBoostApr)

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
              extraRewards={extraRewards}
              extraIncentives={extraIncentivesFormatted}
            />
          </TooltipItems>
        )}
        {(rebasingYield ||
          extraRewards.length + extraIncentivesFormatted.length > 0 ||
          !!minBoostApr ||
          !!maxBoostApr) && (
          <TooltipItems>
            <TooltipItem variant="primary" title={t`Total APR`}>
              {formatPercent(totalSupplyRateMinBoost)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {totalAverageSupplyRateMinBoost ? formatPercent(totalAverageSupplyRateMinBoost) : 'N/A'}
            </TooltipItem>
          </TooltipItems>
        )}
        {(minBoostApr ?? 0) > 0 && (
          <TooltipItems secondary>
            <TooltipItem variant="subItem" title={t`Extra CRV (veCRV Boost)`}>
              {formatPercent(minBoostApr)}
            </TooltipItem>
          </TooltipItems>
        )}
        {(maxBoostApr ?? 0) > 0 && (
          <TooltipItems>
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
