import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

export const MaxLeverageCell = ({ getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number | null>) => {
  const value = getValue()
  return (
    <Typography variant="tableCellMBold">
      {formatNumber(value, { abbreviate: false, fallback: '-', maximumSignificantDigits: 2, unit: 'multiplier' })}
    </Typography>
  )
}
