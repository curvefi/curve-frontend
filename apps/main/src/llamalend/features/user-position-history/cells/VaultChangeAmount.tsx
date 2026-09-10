import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'

export const VaultChangeAmount = ({ value, symbol }: { value: number; symbol?: string }) => (
  <Typography variant="tableCellMBold" color={value === 0 ? 'textPrimary' : value > 0 ? 'success' : 'error'}>
    {value > 0 ? '+' : ''}
    {formatNumber(value, { abbreviate: false })} {symbol}
  </Typography>
)
