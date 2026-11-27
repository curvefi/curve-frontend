import Typography from '@mui/material/Typography'
import type { Row } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { RowExpansionToggle } from '../../RowExpansionToggle'
import { IndentBox } from '../IndentBox'
import type { ActivityRow } from '../types'

export const ActivityActionCell = ({ row }: { row: Row<CurveTableFeatures, ActivityRow> }) => {
  const { action, deltas } = row.original
  const isMobile = useIsMobile()
  const label = (
    <Typography component="span" variant="tableCellValue" color={action.color}>
      {action.label}
    </Typography>
  )

  if (isMobile) return label

  return deltas.length > 1 ? <RowExpansionToggle row={row}>{label}</RowExpansionToggle> : <IndentBox>{label}</IndentBox>
}
