import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'
import { HistoryTableCell } from './HistoryTableCell'

export const DebtChangeCell = ({
  row: {
    original: { loanChange, borrowToken },
  },
}: CellContext<ParsedUserCollateralEvent, unknown>) => (
  <HistoryTableCell>
    <Typography variant="tableCellMBold" color={!loanChange ? 'textPrimary' : loanChange > 0 ? 'error' : 'success'}>
      {loanChange > 0 ? '+' : ''}
      {loanChange ? `${formatNumber(loanChange)} ${borrowToken?.symbol}` : '-'}
    </Typography>
  </HistoryTableCell>
)
