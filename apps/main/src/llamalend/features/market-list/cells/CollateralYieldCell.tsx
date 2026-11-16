import { getCollateralYieldLines } from '@/llamalend/collateral-yields'
import { COLLATERAL_YIELD_TITLE } from '@/llamalend/constants'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { formatCappedRatePercent } from '@ui/lib/rates.utils'

/** The collateral yield, with a tooltip that breaks it down into the yields the market has. */
export const CollateralYieldCell = ({
  row: {
    original: { collateralYields, assets },
  },
  getValue,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const lines = getCollateralYieldLines(collateralYields, 'collateral', assets.collateral.symbol)
  const value = (
    <Typography variant="tableCellValue" color="textPrimary" sx={{ textAlign: 'right' }}>
      {formatNumber(getValue(), 'percent.rate')}
    </Typography>
  )
  return lines.length > 0 ? (
    <Tooltip
      title={COLLATERAL_YIELD_TITLE}
      body={
        <TooltipWrapper>
          <TooltipItems secondary>
            {lines.map(({ label, apr }) => (
              <TooltipItem key={label} title={label}>
                {formatCappedRatePercent(apr)}
              </TooltipItem>
            ))}
          </TooltipItems>
        </TooltipWrapper>
      }
    >
      {value}
    </Tooltip>
  ) : (
    value
  )
}
