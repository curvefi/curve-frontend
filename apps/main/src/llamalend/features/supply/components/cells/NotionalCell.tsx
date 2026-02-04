import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { formatUsd } from '@ui-kit/utils'

const formatNotional = (notional: number | undefined) => (notional == null ? '-' : formatUsd(notional))

export const NotionalCell = ({ notional, isLoading }: { notional: number | undefined; isLoading: boolean }) => (
  <InlineTableCell>
    <WithSkeleton loading={isLoading} sx={{ width: '3rem', height: '1lh' }}>
      <Typography variant="tableCellMBold">{formatNotional(notional)}</Typography>
    </WithSkeleton>
  </InlineTableCell>
)
