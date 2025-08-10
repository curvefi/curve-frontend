import Stack from '@mui/material/Stack'
import type { PoolRewards } from '@ui-kit/entities/campaigns'
import { useMarketExtraIncentives } from '@ui-kit/hooks/useMarketExtraIncentives'
import { t } from '@ui-kit/lib/i18n'
import { TooltipItem, TooltipItems, TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { RewardsTooltipItems, type ExtraIncentiveItem } from './RewardTooltipItems'
import { formatPercent } from './utils'

export type MarketSupplyRateTooltipProps = {
  supplyRate: number | null | undefined
  averageRate: number | null | undefined
  periodLabel: string
  extraRewards: PoolRewards[]
  extraIncentives: ExtraIncentiveItem[]
  minBoostApr: number | null | undefined
  maxBoostApr: number | null | undefined
  rebasingYield: number | null | undefined
  rebasingSymbol?: string | null | undefined
  isLoading: boolean
}

export const MarketSupplyRateTooltip = ({
  supplyRate,
  averageRate,
  periodLabel,
  extraRewards,
  extraIncentives,
  minBoostApr,
  maxBoostApr,
  rebasingYield,
  rebasingSymbol,
  isLoading,
}: MarketSupplyRateTooltipProps) => {
  const extraIncentivesApr = extraIncentives.reduce((acc, x) => acc + x.percentage, 0)
  const totalAprMinBoost = (supplyRate ?? 0) + (minBoostApr ?? 0) + extraIncentivesApr
  const totalAprMaxBoost = (supplyRate ?? 0) + (maxBoostApr ?? 0) + extraIncentivesApr
  const extraIncentivesFormatted = useMarketExtraIncentives('supply', extraIncentives, minBoostApr)

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
        <TooltipItems secondary>
          {!!rebasingYield && rebasingSymbol && (
            <TooltipItem variant="subItem" title={rebasingSymbol}>
              {formatPercent(rebasingYield)}
            </TooltipItem>
          )}
          {(extraRewards.length > 0 || extraIncentives.length > 0) && (
            <RewardsTooltipItems
              title={t`Staking incentives`}
              extraRewards={extraRewards}
              extraIncentives={extraIncentivesFormatted}
            />
          )}
        </TooltipItems>
        <TooltipItems>
          <TooltipItem variant="primary" title={t`Total APR`}>
            {formatPercent(totalAprMinBoost)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {averageRate ? formatPercent(averageRate) : 'N/A'}
          </TooltipItem>
        </TooltipItems>
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
              {formatPercent(totalAprMaxBoost)}
            </TooltipItem>
          </TooltipItems>
        )}
      </Stack>
    </TooltipWrapper>
  )
}
