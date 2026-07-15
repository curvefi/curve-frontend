import type { FunctionComponent } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { assert } from '@primitives/objects.utils'
import { CellContext } from '@tanstack/react-table'
import { TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketType, MarketRateType } from '@ui-kit/types/market'
import { formatNumber } from '@ui-kit/utils'
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

export const RateCell = ({
  row: { original: market },
  getValue,
  column: { id },
}: CellContext<LlamaMarket, number | null>) => {
  const rateType = assert(RateTypes[id as keyof typeof RateTypes], `RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType][market.type]
  const rate = getValue()
  return (
    // The box container makes sure the tooltip doesn't span the entire cell, so the tooltip arrow is placed correctly
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <Tooltip market={market}>
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellMBold" color="textPrimary">
            {rate == null ? '—' : formatNumber(rate, 'percent.rate')}
          </Typography>

          <RewardsIcons market={market} rateType={rateType} />
        </Stack>
      </Tooltip>
    </Box>
  )
}
