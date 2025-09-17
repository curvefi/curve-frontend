import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatDate } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

export const TimestampCell = ({
  row: {
    original: { timestamp },
  },
}: CellContext<ParsedUserCollateralEvent, any>) => (
  <Stack paddingTop={Spacing.sm} paddingBottom={Spacing.sm} paddingRight={Spacing.sm}>
    <Typography variant="tableCellSBold">{formatDate(timestamp, 'long')}</Typography>
  </Stack>
)
