import { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../../columns.enum'
import { formatPercentFixed } from '../cell.format'
import { BorrowRateTooltip } from './BorrowRateTooltip'
import { LendRateTooltip } from './LendRateTooltip'
import { RewardsIcons } from './RewardsIcons'

const { Spacing } = SizesAndSpaces

const RateTypes = {
  [LlamaMarketColumnId.LendRate]: 'lend',
  [LlamaMarketColumnId.BorrowRate]: 'borrow',
} as const

const TooltipComponents = {
  lend: LendRateTooltip,
  borrow: BorrowRateTooltip,
} as const

export const RateCell = ({ row: { original: market }, getValue, column: { id } }: CellContext<LlamaMarket, number>) => {
  const rate = getValue()
  const rateType = RateTypes[id as keyof typeof RateTypes]
  if (!rateType) throw new Error(`RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType]
  return (
    <Tooltip market={market}>
      <Stack gap={Spacing.xs}>
        <Typography variant="tableCellMBold" color="textPrimary">
          {rate != null && formatPercentFixed(rate)}
        </Typography>

        <RewardsIcons market={market} rateType={rateType} />
      </Stack>
    </Tooltip>
  )
}
