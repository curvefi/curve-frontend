import { LlamaMarket } from '@/loan/entities/llama-markets'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export const PriceCell = ({ getValue, row }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  if (value == null) {
    return '-'
  }
  const usdPrice = row.original.assets.borrowed.usdPrice
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="tableCellMBold">{formatNumber(value, { notation: 'compact' })}</Typography>
      <Typography variant="bodySRegular">
        {usdPrice && formatNumber(value / usdPrice, { currency: 'USD', notation: 'compact' })}
      </Typography>
    </Stack>
  )
}
