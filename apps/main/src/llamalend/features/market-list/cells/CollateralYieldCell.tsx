import { getCollateralYieldLines } from '@/llamalend/collateral-yields'
import { COLLATERAL_YIELD_TITLE } from '@/llamalend/constants'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PercentCell } from './PercentCell'

/** The collateral yield, with a tooltip that breaks it down into the yields the market has. */
export const CollateralYieldCell = (props: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { collateralYields, assets } = props.row.original
  const lines = getCollateralYieldLines(collateralYields, 'collateral', assets.collateral.symbol)
  return lines.length > 0 ? (
    <Tooltip
      title={COLLATERAL_YIELD_TITLE}
      body={
        <TooltipWrapper>
          <TooltipItems secondary>
            {lines.map(({ label, apr }) => (
              <TooltipItem key={label} title={label}>
                {formatNumber(apr, 'percent.rate')}
              </TooltipItem>
            ))}
          </TooltipItems>
        </TooltipWrapper>
      }
    >
      <PercentCell {...props} />
    </Tooltip>
  ) : (
    <PercentCell {...props} />
  )
}
