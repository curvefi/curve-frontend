import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { RewardsTooltipItems } from '@/llamalend/PageLlamaMarkets/cells/RateCell/RewardsTooltipItems'
import { TooltipItem, TooltipItems } from '@/llamalend/PageLlamaMarkets/cells/RateCell/TooltipItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useSnapshots } from '../../hooks/useSnapshots'
import { formatPercent } from '../cell.format'

const { Spacing } = SizesAndSpaces

const BorrowRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { rate, averageRate, period } = useSnapshots(market, 'borrow')
  return (
    <Stack gap={Spacing.sm}>
      <Typography color="textSecondary">
        {t`The borrow rate is the cost related to your borrow and varies according to the market and its utilization.`}
      </Typography>
      <Stack>
        <TooltipItems secondary>
          <TooltipItem loading={rate == null} title={t`Borrow Rate`}>
            {formatPercent(rate)}
          </TooltipItem>
          <RewardsTooltipItems title={t`Borrowing incentives`} market={market} type="borrow" />
        </TooltipItems>
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
