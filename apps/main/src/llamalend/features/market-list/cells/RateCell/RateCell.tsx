import type { FunctionComponent } from 'react'
import { formatEstimatedNetBorrowRate, formatNetSupplyRate } from '@/llamalend/llama.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { assert, type PartialRecord } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { TooltipProps } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { formatCappedRatePercent } from '@ui/lib/rates.utils'
import { MarketColumnId } from '../../columns/columns.enum'
import { useHasNetRate } from '../../hooks/useHasNetRate'
import { BorrowRateTooltip } from './BorrowRateTooltip'
import { RewardsIcons } from './RewardsIcons'
import { SupplyRateLendTooltip } from './SupplyRateLendTooltip'
import { SupplyRateMintTooltip } from './SupplyRateMintTooltip'

const { Spacing } = SizesAndSpaces

export type RateTooltipProps = { market: LlamaMarket; children: TooltipProps['children'] }

const RATE_COLUMNS: PartialRecord<
  MarketColumnId,
  { rateType: MarketRateType; getSubRate?: (market: LlamaMarket) => string }
> = {
  [MarketColumnId.BorrowRate]: {
    rateType: MarketRateType.Borrow,
    getSubRate: ({ rates }) => formatEstimatedNetBorrowRate(rates.borrowTotalApr),
  },
  [MarketColumnId.NetBorrowRate]: { rateType: MarketRateType.Borrow },
  [MarketColumnId.SupplyRate]: {
    rateType: MarketRateType.Supply,
    getSubRate: ({ rates }) => formatNetSupplyRate(rates.lendTotalApyMinBoosted),
  },
  [MarketColumnId.NetSupplyRate]: { rateType: MarketRateType.Supply },
}

const TooltipComponents: Record<MarketRateType, Record<MarketType, FunctionComponent<RateTooltipProps>>> = {
  [MarketRateType.Supply]: { [MarketType.Lend]: SupplyRateLendTooltip, [MarketType.Mint]: SupplyRateMintTooltip },
  [MarketRateType.Borrow]: { [MarketType.Lend]: BorrowRateTooltip, [MarketType.Mint]: BorrowRateTooltip },
} as const

export const RateCell = <TValue extends number | null>({
  row: { original: market },
  getValue,
  column: { id },
}: CellContext<CurveTableFeatures, LlamaMarketRow, TValue>) => {
  const { rateType, getSubRate } = assert(RATE_COLUMNS[id as MarketColumnId], `RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType][market.type]
  const rate = getValue()
  const rewardsIcons = <RewardsIcons market={market} rateType={rateType} />
  const hasNetRate = useHasNetRate(market, rateType)
  return (
    // The box container makes sure the tooltip doesn't span the entire cell, so the tooltip arrow is placed correctly
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <Tooltip market={market}>
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellValueStrong" color="textPrimary">
            {formatCappedRatePercent(rate)}
          </Typography>

          {rate != null && getSubRate && hasNetRate ? (
            <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
              <Typography variant="tableCellSupport" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>
                {getSubRate(market)}
              </Typography>
              {rewardsIcons}
            </Stack>
          ) : (
            rewardsIcons
          )}
        </Stack>
      </Tooltip>
    </Box>
  )
}
