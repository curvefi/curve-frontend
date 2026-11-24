import { RowExpansionToggle } from '@evm-ui/shared/ui/DataTable/RowExpansionToggle'
import Typography from '@mui/material/Typography'
import type { Row } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import type { ActivityRow } from '../types'

export const ActivityActionCell = ({ row }: { row: Row<CurveTableFeatures, ActivityRow> }) => {
  const { action, deltas } = row.original
  const showToggle = !useIsMobile() && deltas.length > 1
  const label = (
    <Typography component="span" variant="tableCellValue" color={action.color}>
      {action.label}
    </Typography>
  )

  return showToggle ? <RowExpansionToggle row={row}>{label}</RowExpansionToggle> : label
}
