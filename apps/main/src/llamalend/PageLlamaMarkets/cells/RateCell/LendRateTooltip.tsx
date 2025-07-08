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
  const { rate, averageRate, period, maxBoostedAprAverage } = useSnapshots(market, rateType)
  const {
    rates,
    rates: { lendCrvAprBoosted, lendCrvAprUnboosted },
    assets: { collateral },
    rewards,
    type: marketType,
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, rates)
  const yieldBearing = collateral.symbol === 'wstETH' // todo: show yield bearing assets APR with API data
  return (
    <Stack gap={Spacing.sm}>
      <Stack>
        <Typography color="textSecondary">
          {t`The supply yield is the estimated earnings related to your share of the pool. `}
          {t`It varies according to the market and the monetary policy.`}
        </Typography>
        {yieldBearing && (
          <Typography color="textSecondary">{t`The collateral of this market is yield bearing and offer extra yield.`}</Typography>
        )}
      </Stack>
      <Stack>
        <TooltipItems secondary>
          <TooltipItem loading={rate == null} title={t`Lending fees`}>
            {formatPercent(rate)}
          </TooltipItem>
          <RewardsTooltipItems title={t`Staking incentives`} {...{ poolRewards, extraIncentives }} />
        </TooltipItems>
        <TooltipItems>
          <TooltipItem primary loading={rate == null} title={`${t`Total base APR`}`}>
            {formatPercent((rate ?? 0) + (lendCrvAprUnboosted ?? 0))}
          </TooltipItem>
          <TooltipItem subitem loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </TooltipItems>
        {(lendCrvAprBoosted ?? 0) > 0 && (
          <Stack bgcolor={t => t.design.Layer[2].Fill} padding={Spacing.sm}>
            <TooltipItem subitem title={t`Extra CRV (veCRV Boost)`}>
              {formatPercent(lendCrvAprBoosted)}
            </TooltipItem>
          </Stack>
        )}
        {lendCrvAprBoosted ? (
          <TooltipItems>
            <TooltipItem primary loading={rate == null} title={`${t`Total max veCRV APR`}`}>
              {formatPercent((rate ?? 0) + lendCrvAprBoosted)}
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
