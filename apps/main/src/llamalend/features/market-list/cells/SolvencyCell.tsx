import { SOLVENCY_THRESHOLDS } from '@/llamalend/llama-markets.constants'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Typography, { TypographyProps } from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui-kit/utils'

const getSolvencyColor = (value: number | undefined | null): TypographyProps['color'] => {
  if (value == null) return 'textPrimary'
  else if (value >= SOLVENCY_THRESHOLDS.solvent) return 'success'
  else if (value >= SOLVENCY_THRESHOLDS.low) return 'warning'
  else return 'error'
}

export const SolvencyCell = ({ getValue }: CellContext<LlamaMarket, number | null | undefined>) => {
  const value = getValue()
  return (
    <Typography variant="tableCellMBold" color={getSolvencyColor(value)} sx={{ textAlign: 'right' }}>
      {formatNumber(value, 'percent.value')}
    </Typography>
  )
}
