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

export const BorrowRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { rate, averageRate, period } = useSnapshots(market, 'borrow')
  const {
    assets: { collateral },
  } = market
  const yieldBearing = collateral.symbol === 'wstETH' // todo: show yield bearing assets APR with API data
  return (
    <>
      <Stack gap={2}>
        <Typography color="textSecondary">{t`The borrow APR is the cost related to your borrow and varies according to the market and crvUSD’s peg.`}</Typography>
        {yieldBearing && (
          <Typography color="textSecondary">{t`The collateral of this market is yield bearing and offer extra yield.`}</Typography>
        )}
      </Stack>
      <Stack>
        <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm} marginBlock={Spacing.sm}>
          <TooltipItem loading={rate == null} title={t`Borrow Rate`}>
            {formatPercent(rate)}
          </TooltipItem>
          <RewardsTooltipItems title={t`Borrowing incentives`} market={market} type="borrow" />
        </Stack>
        <Stack>
          <TooltipItem loading={rate == null} title={t`Total Borrow APR`}>
            {formatPercent(rate)}
          </TooltipItem>
          <TooltipItem subitem loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </Stack>
      </Stack>
    </>
  )
}
