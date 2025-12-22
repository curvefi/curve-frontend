import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../../columns'
import { BorrowRateTooltip } from './BorrowRateTooltip'
import { RewardsIcons } from './RewardsIcons'
import { SupplyRateLendTooltip } from './SupplyRateLendTooltip'
import { SupplyRateMintTooltip } from './SupplyRateMintTooltip'

const { Spacing } = SizesAndSpaces

const RateTypes = {
  [LlamaMarketColumnId.LendRate]: MarketRateType.Supply,
  [LlamaMarketColumnId.BorrowRate]: MarketRateType.Borrow,
} as const

const TooltipComponents = {
  [MarketRateType.Supply]: {
    [LlamaMarketType.Lend]: SupplyRateLendTooltip,
    [LlamaMarketType.Mint]: SupplyRateMintTooltip,
  },
  [MarketRateType.Borrow]: {
    [LlamaMarketType.Lend]: BorrowRateTooltip,
    [LlamaMarketType.Mint]: BorrowRateTooltip,
  },
} as const

export const RateCell = ({
  row: { original: market },
  getValue,
  column: { id },
}: CellContext<LlamaMarket, number | null>) => {
  const rateType = RateTypes[id as keyof typeof RateTypes]
  if (!rateType) throw new Error(`RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType][market.type]

  const rate = getValue()
  return (
    // The box container makes sure the tooltip doesn't span the entire cell, so the tooltip arrow is placed correctly
    <Box display="flex" justifyContent="end">
      <Tooltip market={market}>
        <Stack gap={Spacing.xs} alignItems="end">
          <Typography variant="tableCellMBold" color="textPrimary">
            {rate == null ? '—' : formatPercent(rate)}
          </Typography>

          <RewardsIcons market={market} rateType={rateType} />
        </Stack>
      </Tooltip>
    </Box>
  )
}
