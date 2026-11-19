import { getCollateralYieldBreakdown } from '@/llamalend/collateral-yields'
import { COLLATERAL_YIELD_TITLE } from '@/llamalend/constants'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

/** The collateral yield, with a tooltip that breaks it down into the yields the market has. */
export const CollateralYieldCell = ({
  row: {
    original: { collateralYields, assets },
  },
  getValue,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const breakdown = getCollateralYieldBreakdown(collateralYields, 'collateral', assets.collateral.symbol)
  return (
    <WithWrapper
      Wrapper={Tooltip}
      shouldWrap={breakdown.length}
      title={COLLATERAL_YIELD_TITLE}
      body={
        <TooltipWrapper>
          <TooltipItems secondary>
            {breakdown.map(({ label, apr }) => (
              <TooltipItem key={label} title={label}>
                {formatNumber(apr, 'percent.rate')}
              </TooltipItem>
            ))}
          </TooltipItems>
        </TooltipWrapper>
      }
    >
      <Typography variant="tableCellValue">{formatNumber(getValue(), 'percent.rate')}</Typography>
    </WithWrapper>
  )
}
