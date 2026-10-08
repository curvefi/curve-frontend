import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import type { MarketEventRow } from '../types'
import { getLlammaEventAction } from '../utils'

type LlammaEventActionCellProps = { event: MarketEventRow }

export const LlammaEventActionCell = ({ event }: LlammaEventActionCellProps) => {
  const { label, color } = getLlammaEventAction(event)
  return (
    <InlineTableCell>
      <Typography variant="tableCellValue" color={color}>
        {label}
      </Typography>
    </InlineTableCell>
  )
}
