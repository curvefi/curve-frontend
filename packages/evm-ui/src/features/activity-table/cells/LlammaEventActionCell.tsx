import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import Typography from '@mui/material/Typography'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow } from '../types'

type LlammaEventActionCellProps = {
  event: MarketEventRow
}

export const LlammaEventActionCell = ({ event }: LlammaEventActionCellProps) => {
  const isDeposit = !!event.deposit
  const label = isDeposit ? t`Deposit` : t`Withdrawal`

  return (
    <InlineTableCell>
      <Typography variant="tableCellMBold" color={isDeposit ? 'success' : 'error'}>
        {label}
      </Typography>
    </InlineTableCell>
  )
}
