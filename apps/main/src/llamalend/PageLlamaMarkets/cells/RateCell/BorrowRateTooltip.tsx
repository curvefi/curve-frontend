import { ReactElement } from 'react'
import { TooltipItem, TooltipItems } from '@/llamalend/components/TooltipItem'
import { LlamaMarket, LlamaMarketType } from '@/llamalend/entities/llama-markets'
import { useMarketExtraIncentives } from '@/llamalend/hooks/useMarketExtraIncentives'
import { RewardsTooltipItems } from '@/llamalend/PageLlamaMarkets/cells/RateCell/RewardsTooltipItems'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useSnapshots } from '../../hooks/useSnapshots'
import { formatPercent, useFilteredRewards } from '../cell.format'

const { Spacing } = SizesAndSpaces

const messages = {
  [LlamaMarketType.Lend]: t`The borrow rate is the cost related to your borrow and varies according to the lend market and its utilization.`,
  [LlamaMarketType.Mint]: t`The borrow rate is the cost related to your borrow and varies according to the mint market and the crvUSD peg (or price).`,
}

const rateType = 'borrow' as const

const BorrowRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { rewards, type: marketType, rates } = market
  const { rate, averageRate, period } = useSnapshots(market, rateType)
  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, rates)
  return (
    <Stack gap={Spacing.sm}>
      <Typography color="textSecondary">{messages[marketType]}</Typography>
      <Stack>
        {(poolRewards.length > 0 || extraIncentives.length > 0) && (
          <TooltipItems secondary>
            <TooltipItem loading={rate == null} title={t`Borrow Rate`}>
              {formatPercent(rate)}
            </TooltipItem>
            <RewardsTooltipItems title={t`Borrowing incentives`} {...{ poolRewards, extraIncentives }} />
          </TooltipItems>
        )}
        <TooltipItems>
          <TooltipItem primary loading={rate == null} title={t`Total Borrow Rate`}>
            {formatPercent(rate)}
          </TooltipItem>
          <TooltipItem subitem loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </TooltipItems>
      </Stack>
    </Stack>
  )
}

export const BorrowRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip clickable title={t`Borrow Rate`} body={<BorrowRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
