import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

export const DebtChangeCell = ({
  row: {
    original: { loanChange, borrowToken },
  },
}: CellContext<ParsedUserCollateralEvent, unknown>) => (
  <InlineTableCell>
    <Typography variant="tableCellMBold" color={!loanChange ? 'textPrimary' : loanChange > 0 ? 'error' : 'success'}>
      {loanChange > 0 ? '+' : ''}
      {loanChange ? `${formatNumber(loanChange)} ${borrowToken?.symbol}` : '-'}
    </Typography>
  </InlineTableCell>
)
