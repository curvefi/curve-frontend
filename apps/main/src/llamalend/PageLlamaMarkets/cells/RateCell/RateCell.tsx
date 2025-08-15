import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from '../../columns.enum'
import { formatPercent } from '../cell.format'
import { BorrowRateTooltip } from './BorrowRateTooltip'
import { LendRateTooltip } from './LendRateTooltip'
import { RewardsIcons } from './RewardsIcons'

const { Spacing } = SizesAndSpaces

const RateTypes = {
  [LlamaMarketColumnId.LendRate]: MarketRateType.Supply,
  [LlamaMarketColumnId.BorrowRate]: MarketRateType.Borrow,
} as const

const TooltipComponents = {
  [MarketRateType.Supply]: LendRateTooltip,
  [MarketRateType.Borrow]: BorrowRateTooltip,
} as const

export const RateCell = ({
  row: { original: market },
  getValue,
  column: { id },
}: CellContext<LlamaMarket, number | null>) => {
  const rate = getValue()
  if (rate == null) return null // mint markets do not have a supply rate

  const rateType = RateTypes[id as keyof typeof RateTypes]
  if (!rateType) throw new Error(`RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType]
  return (
    // The box container makes sure the tooltip doesn't span the entire cell, so the tooltip arrow is placed correctly
    <Box display="flex" justifyContent="end">
      <Tooltip market={market}>
        <Stack gap={Spacing.xs} alignItems="end">
          <Typography variant="tableCellMBold" color="textPrimary">
            {formatPercent(rate)}
          </Typography>

          <RewardsIcons market={market} rateType={rateType} />
        </Stack>
      </Tooltip>
    </Box>
  )
}
