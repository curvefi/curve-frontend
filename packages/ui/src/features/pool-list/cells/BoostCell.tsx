import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { DISABLED_Q, type QueryProp } from '@ui/features/queries/util'

export const BoostCell = ({
  boost: { data, error, isLoading } = DISABLED_Q,
}: {
  boost: QueryProp<Decimal | null> | undefined
}) => (
  <Stack sx={{ alignItems: 'end' }}>
    {isLoading ? (
      <Skeleton width="3rem" />
    ) : error ? (
      <ErrorIconButton error={error} size="extraSmall" />
    ) : (
      <Typography variant="tableCellValue">{formatNumber(data, 'multiplier')}</Typography>
    )}
  </Stack>
)
