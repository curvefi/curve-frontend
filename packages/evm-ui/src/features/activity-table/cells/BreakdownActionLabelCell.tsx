import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { IndentIcon } from '@ui/icons/IndentIcon'

const { Spacing } = SizesAndSpaces

/** Action label of a breakdown row, indented under the action of its parent row */
export const BreakdownActionLabelCell = ({ label }: { label: string }) => (
  <InlineTableCell>
    <Typography variant="tableCellValue">
      <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
        <IndentIcon fontSize="small" />
        {label}
      </Stack>
    </Typography>
  </InlineTableCell>
)
