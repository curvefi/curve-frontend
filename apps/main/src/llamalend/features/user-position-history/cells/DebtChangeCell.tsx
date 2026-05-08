import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { formatNumber } from '@ui-kit/utils'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

export const DebtChangeCell = ({
  row: {
    original: { loanChange, borrowToken },
  },
}: CellContext<ParsedUserCollateralEvent, unknown>) => (
  <InlineTableCell>
    <Typography variant="tableCellMBold" color={!loanChange ? 'textPrimary' : loanChange > 0 ? 'error' : 'success'}>
      {loanChange > 0 ? '+' : ''}
      {`${formatNumber(loanChange, { abbreviate: false })} ${borrowToken?.symbol}`}
    </Typography>
  </InlineTableCell>
)
