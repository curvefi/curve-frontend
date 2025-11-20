import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Decimal, formatNumber } from '@ui-kit/utils'

export const FormMessage = ({
  value,
  label,
  symbol,
}: {
  value: Decimal
  label: string
  symbol: string | undefined
}) => (
  <Stack alignItems="center" direction="row" gap={1}>
    <Typography color="text.secondary" variant="bodyXsRegular">
      {label}
    </Typography>
    <Typography color="text.tertiary" variant="bodyXsRegular">
      {formatNumber(value, { abbreviate: true }) ?? '...'}
      {symbol}
    </Typography>
  </Stack>
)
