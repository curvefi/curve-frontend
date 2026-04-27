import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { ClosePositionRow } from '../columns/columns.definitions'
import { BaseCell } from './BaseCell'

export const LabelCellDisplay = ({
  label,
  isFooter = false,
}: {
  label: ClosePositionRow['label']
  isFooter?: boolean
}) => (
  <Typography
    variant={isFooter ? 'tableCellMBold' : 'tableCellMRegular'}
    color={isFooter ? 'textPrimary' : 'textSecondary'}
  >
    {label}
  </Typography>
)

export const LabelCell = ({ getValue }: CellContext<ClosePositionRow, ClosePositionRow['label'] | undefined>) => {
  const value = getValue()
  return (
    value != null && (
      // Min width of 16ch so labels don't wrap (biggest one is 'Paid from collateral')
      <BaseCell sx={{ minWidth: '16ch' }}>
        <LabelCellDisplay label={value} />
      </BaseCell>
    )
  )
}
