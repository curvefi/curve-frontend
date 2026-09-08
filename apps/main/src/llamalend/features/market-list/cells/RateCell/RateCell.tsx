import type { FunctionComponent } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { formatCappedRatePercent } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { assert } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { TooltipProps } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { MarketColumnId } from '../../columns'
import { BorrowRateTooltip } from './BorrowRateTooltip'
import { RewardsIcons } from './RewardsIcons'
import { SupplyRateLendTooltip } from './SupplyRateLendTooltip'
import { SupplyRateMintTooltip } from './SupplyRateMintTooltip'

const { Spacing } = SizesAndSpaces

export type RateTooltipProps = { market: LlamaMarket; children: TooltipProps['children'] }

const RateTypes = {
  [MarketColumnId.LendRate]: MarketRateType.Supply,
  [MarketColumnId.BorrowRate]: MarketRateType.Borrow,
  [MarketColumnId.NetBorrowRate]: MarketRateType.Borrow,
} as const

const TooltipComponents: Record<MarketRateType, Record<MarketType, FunctionComponent<RateTooltipProps>>> = {
  [MarketRateType.Supply]: {
    [MarketType.Lend]: SupplyRateLendTooltip,
    [MarketType.Mint]: SupplyRateMintTooltip,
  },
  [MarketRateType.Borrow]: {
    [MarketType.Lend]: BorrowRateTooltip,
    [MarketType.Mint]: BorrowRateTooltip,
  },
} as const

export const RateCell = <TValue extends number | null>({
  row: { original: market },
  getValue,
  column: { id },
}: CellContext<CurveTableFeatures, LlamaMarketRow, TValue>) => {
  const rateType = assert(RateTypes[id as keyof typeof RateTypes], `RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType][market.type]
  const rate = getValue()
  return (
    // The box container makes sure the tooltip doesn't span the entire cell, so the tooltip arrow is placed correctly
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <Tooltip market={market}>
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellMBold" color="textPrimary">
            {formatCappedRatePercent(rate)}
          </Typography>

          <RewardsIcons market={market} rateType={rateType} />
        </Stack>
      </Tooltip>
    </Box>
  )
}
