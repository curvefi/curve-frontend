import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

export const MaxLeverageCell = ({ getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number | Nullish>) => {
  const value = getValue()
  const beta = useNewLlamalendHealth()
  return (
    <Typography variant="tableCellMBold">
      {formatNumber(value, {
        abbreviate: false,
        fallback: '-',
        maximumSignificantDigits: beta ? undefined : 2,
        unit: 'multiplier',
      })}
    </Typography>
  )
}
