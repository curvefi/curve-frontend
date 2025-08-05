import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useMarketExtraIncentives } from '@/llamalend/hooks/useMarketExtraIncentives'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TooltipItem, TooltipItems } from '../../../components/TooltipItem'
import { useSnapshots } from '../../hooks/useSnapshots'
import { formatPercent, useFilteredRewards } from '../cell.format'
import { RewardsTooltipItems } from './RewardsTooltipItems'

const { Spacing } = SizesAndSpaces

const rateType = 'lend' as const

const LendRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { averageRate, period, maxBoostedAprAverage } = useSnapshots(market, rateType)
  const {
    chain,
    rates,
    rates: { lend, lendApr, lendCrvAprBoosted },
    assets: { borrowed },
    rewards,
    type: marketType,
  } = market

  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, chain, rates)
  const extraIncentivesApr = extraIncentives.reduce((acc, x) => acc + x.percentage, 0)

  return (
    <Stack gap={Spacing.sm}>
      <Stack>
        <Typography color="textSecondary">
          {t`The supply yield is the estimated earnings related to your share of the pool. `}
          {t`It varies according to the market and the monetary policy.`}
        </Typography>
        {!!borrowed.rebasingYield && (
          <Typography color="textSecondary">{t`The collateral of this market is yield bearing and offer extra yield.`}</Typography>
        )}
      </Stack>
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Lending fees`}>{formatPercent(lendApr)}</TooltipItem>
          {!!borrowed.rebasingYield && (
            <TooltipItem subitem title={borrowed.symbol}>
              {formatPercent(borrowed.rebasingYield)}
            </TooltipItem>
          )}
          {poolRewards.length + extraIncentives.length > 0 && (
            <RewardsTooltipItems title={t`Staking incentives`} {...{ poolRewards, extraIncentives }} />
          )}
        </TooltipItems>
        <TooltipItems>
          <TooltipItem primary title={`${t`Total APR`}`}>
            {formatPercent(lend)}
          </TooltipItem>
          <TooltipItem subitem loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </TooltipItems>
        {(lendCrvAprBoosted ?? 0) > 0 && (
          <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm}>
            <TooltipItem subitem title={t`Extra CRV (veCRV Boost)`}>
              {formatPercent(lendCrvAprBoosted)}
            </TooltipItem>
          </Stack>
        )}
        {lendCrvAprBoosted ? (
          <TooltipItems>
            <TooltipItem primary title={`${t`Total max boosted APR`}`}>
              {formatPercent((lendApr ?? 0) + lendCrvAprBoosted + extraIncentivesApr)}
            </TooltipItem>
            <TooltipItem subitem loading={maxBoostedAprAverage == null} title={t`7D average`}>
              {formatPercent(maxBoostedAprAverage)}
            </TooltipItem>
          </TooltipItems>
        ) : null}
      </Stack>
    </Stack>
  )
}

export const LendRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip clickable title={t`Supply Yield`} body={<LendRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
