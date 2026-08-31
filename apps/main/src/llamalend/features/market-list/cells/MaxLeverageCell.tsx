import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'

export const MaxLeverageCell = ({ getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number | null>) => {
  const value = getValue()
  return (
    <Typography variant="tableCellMBold">
      {formatNumber(value, { abbreviate: false, fallback: '-', maximumSignificantDigits: 2, unit: 'multiplier' })}
    </Typography>
  )
}
