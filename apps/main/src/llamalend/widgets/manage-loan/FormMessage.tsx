import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui-kit/utils'

export const FormMessage = ({
  value,
  label,
  symbol,
}: {
  value: Decimal
  label: string
  symbol: string | undefined
}) => (
  <Typography component={Stack} alignItems="center" direction="row" gap={1}>
    {label}
    <Typography color="text.secondary">
      {formatNumber(value, { abbreviate: true }) ?? '...'}
      {symbol}
    </Typography>
  </Typography>
)
