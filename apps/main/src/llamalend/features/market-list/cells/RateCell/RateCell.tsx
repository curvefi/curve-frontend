import type { FunctionComponent } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { assert } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { TooltipProps } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { formatCappedRatePercent } from '@ui/lib/rates.utils'
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
  [MarketRateType.Supply]: { [MarketType.Lend]: SupplyRateLendTooltip, [MarketType.Mint]: SupplyRateMintTooltip },
  [MarketRateType.Borrow]: { [MarketType.Lend]: BorrowRateTooltip, [MarketType.Mint]: BorrowRateTooltip },
} as const

export const RateCell = <TValue extends number | null>({
  row: { original: market },
  getValue,
  column: { id },
  table,
}: CellContext<CurveTableFeatures, LlamaMarketRow, TValue>) => {
  const columnId = id as MarketColumnId
  const rateType = assert(RateTypes[columnId as keyof typeof RateTypes], `RateCell: Unsupported column ID "${id}"`)
  const Tooltip = TooltipComponents[rateType][market.type]
  const rate = getValue()
  const netBorrow = table.options.meta?.showNetBorrowApr && columnId === MarketColumnId.BorrowRate
  const netSupply = table.options.meta?.showNetSupplyApy && columnId === MarketColumnId.LendRate
  const rewards = <RewardsIcons market={market} rateType={rateType} />
  return (
    // The box container makes sure the tooltip doesn't span the entire cell, so the tooltip arrow is placed correctly
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <Tooltip market={market}>
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellMBold" color="textPrimary">
            {formatCappedRatePercent(rate)}
          </Typography>
          {netBorrow || netSupply ? (
            <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
              <Typography
                variant="bodySRegular"
                sx={{ color: 'text.secondary' }}
                data-testid={netBorrow ? 'user-net-borrow-apr' : 'user-net-supply-apy'}
              >
                {t`Net`} {formatCappedRatePercent(netBorrow ? market.rates.borrowTotalApr : market.rates.lendTotalApyMinBoosted)}
              </Typography>
              {rewards}
            </Stack>
          ) : (
            rewards
          )}
        </Stack>
      </Tooltip>
    </Box>
  )
}
