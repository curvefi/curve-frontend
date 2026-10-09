import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Action label of a breakdown row, indented under the action of its parent row */
export const BreakdownActionLabel = ({ label, color }: { label: string; color: 'success' | 'error' }) => (
  <InlineTableCell sx={{ paddingInlineStart: Spacing.md }}>
    <Typography variant="tableCellValueStrong" color={color}>
      ↳ {label}
    </Typography>
  </InlineTableCell>
)
