import { UNAVAILABLE_NOTATION } from '@/llamalend/widgets/tooltips/tooltip.utils'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { decimalCompare, ZERO } from '@ui/lib/decimal'

export const VaultChangeAmount = ({ value, symbol }: { value: Decimal | undefined; symbol?: string }) => {
  const sign = decimalCompare(value ?? ZERO, ZERO)
  return (
    <Typography variant="tableCellMBold" color={sign === 0 ? 'textPrimary' : sign > 0 ? 'success' : 'error'}>
      {value == null
        ? UNAVAILABLE_NOTATION
        : notFalsy(sign > 0 && '+', formatNumber(value, { abbreviate: false }), ' ', symbol).join('')}
    </Typography>
  )
}
