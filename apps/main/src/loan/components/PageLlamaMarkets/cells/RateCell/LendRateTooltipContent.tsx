import { RewardsTooltipItems } from '@/loan/components/PageLlamaMarkets/cells/RateCell/RewardsTooltipItems'
import { TooltipItem } from '@/loan/components/PageLlamaMarkets/cells/RateCell/TooltipItem'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useSnapshots } from '../../hooks/useSnapshots'
import { formatPercent } from '../cell.format'

const { Spacing } = SizesAndSpaces

export const LendRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { rate, averageRate, period, maxBoostedAprAverage } = useSnapshots(market, 'lend')
  const {
    rates: { lendCrvAprBoosted, lendCrvAprUnboosted },
    assets: { collateral },
  } = market
  const yieldBearing = collateral.symbol === 'wstETH' // todo: show yield bearing assets APR with API data
  return (
    <Stack gap={Spacing.sm}>
      <Stack>
        <Typography color="textSecondary">
          {t`The supply yield is the estimated earnings related to your share of the pool`}
          {t`It varies according to the market and the monetary policy.`}
        </Typography>
        {yieldBearing && (
          <Typography color="textSecondary">{t`The collateral of this market is yield bearing and offer extra yield.`}</Typography>
        )}
      </Stack>
      <Stack>
        <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm} marginBlock={Spacing.sm}>
          <TooltipItem loading={rate == null} title={t`Lending fees`}>
            {formatPercent(rate)}
          </TooltipItem>
          <RewardsTooltipItems market={market} title={t`Staking incentives`} type="lend" />
        </Stack>
        <Stack>
          <TooltipItem primary loading={rate == null} title={`${t`Current base APR`}`}>
            {formatPercent(rate)}
          </TooltipItem>
          <TooltipItem subitem loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </Stack>
        {(lendCrvAprBoosted ?? 0) > 0 && (
          <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm} marginBlock={Spacing.sm}>
            <TooltipItem subitem title={t`Extra CRV (veCRV Boost)`}>
              {formatPercent(lendCrvAprBoosted)}
            </TooltipItem>
          </Stack>
        )}
        {lendCrvAprBoosted ? (
          <Stack>
            <TooltipItem primary loading={rate == null} title={`${t`Current max veCRV APR`}`}>
              {formatPercent(rate! + lendCrvAprBoosted)}
            </TooltipItem>
            <TooltipItem subitem loading={maxBoostedAprAverage == null} title={t`7D average`}>
              {formatPercent(maxBoostedAprAverage)}
            </TooltipItem>
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  )
}
