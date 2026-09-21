import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'

/** Displays a price query without letting its loading or error state affect the rest of the table. */
export const TokenPriceCell = ({ query: { data, error, isLoading } }: { query: QueryProp<number | undefined> }) => (
  <InlineTableCell sx={{ alignItems: 'end' }}>
    <WithSkeleton loading={isLoading} variant="rectangular" width="3rem" height="1lh">
      {data == null && error ? (
        <ErrorIconButton error={error} size="extraExtraSmall" />
      ) : (
        <Typography>{formatNumber(data, 'usd.precise')}</Typography>
      )}
    </WithSkeleton>
  </InlineTableCell>
)
