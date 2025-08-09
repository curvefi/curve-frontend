import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useMarketExtraIncentives } from '@/llamalend/hooks/useMarketExtraIncentives'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { TooltipItem, TooltipItems, TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'
import { useSnapshots } from '../../hooks/useSnapshots'
import { formatPercent, useFilteredRewards } from '../cell.format'
import { RewardsTooltipItems } from './RewardsTooltipItems'

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
    <TooltipWrapper>
      <Stack>
        <TooltipDescription text={t`The supply yield is the estimated earnings related to your share of the pool. `} />
        <TooltipDescription text={t`It varies according to the market and the monetary policy.`} />
        {!!borrowed.rebasingYield && (
          <TooltipDescription text={t`The collateral of this market is yield bearing and offer extra yield.`} />
        )}
      </Stack>
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Lending fees`}>{formatPercent(lendApr)}</TooltipItem>
          {!!borrowed.rebasingYield && (
            <TooltipItem variant="subItem" title={borrowed.symbol}>
              {formatPercent(borrowed.rebasingYield)}
            </TooltipItem>
          )}
          {poolRewards.length + extraIncentives.length > 0 && (
            <RewardsTooltipItems title={t`Staking incentives`} {...{ poolRewards, extraIncentives }} />
          )}
        </TooltipItems>
        <TooltipItems>
          <TooltipItem variant="primary" title={`${t`Total APR`}`}>
            {formatPercent(lend)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </TooltipItems>
        {(lendCrvAprBoosted ?? 0) > 0 && (
          <TooltipItems secondary>
            <TooltipItem variant="subItem" title={t`Extra CRV (veCRV Boost)`}>
              {formatPercent(lendCrvAprBoosted)}
            </TooltipItem>
          </TooltipItems>
        )}
        {lendCrvAprBoosted ? (
          <TooltipItems>
            <TooltipItem variant="primary" title={`${t`Total max boosted APR`}`}>
              {formatPercent((lendApr ?? 0) + lendCrvAprBoosted + extraIncentivesApr)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={maxBoostedAprAverage == null} title={t`7D average`}>
              {formatPercent(maxBoostedAprAverage)}
            </TooltipItem>
          </TooltipItems>
        ) : null}
      </Stack>
    </TooltipWrapper>
  )
}

export const LendRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip clickable title={t`Supply Yield`} body={<LendRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
