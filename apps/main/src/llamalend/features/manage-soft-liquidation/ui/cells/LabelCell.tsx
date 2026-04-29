import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ClosePositionRow } from '../columns/columns.definitions'

const { Spacing } = SizesAndSpaces

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
    whiteSpace="nowrap" // Aesthetics; it looks ugly if this column wraps
  >
    {label}
  </Typography>
)

export const LabelCell = ({ getValue }: CellContext<ClosePositionRow, ClosePositionRow['label'] | undefined>) => {
  const value = getValue()
  return (
    value != null && (
      <Box paddingBlock={Spacing.md}>
        <LabelCellDisplay label={value} />
      </Box>
    )
  )
}
