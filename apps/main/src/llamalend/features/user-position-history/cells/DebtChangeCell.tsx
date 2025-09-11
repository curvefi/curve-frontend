import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserLendCollateralEvent } from '../queries/user-lend-collateral-events'

const { Spacing } = SizesAndSpaces

export const DebtChangeCell = ({ row }: CellContext<ParsedUserLendCollateralEvent, any>) => (
  <Stack padding={Spacing.sm}>
    <Typography variant="tableCellMBold">{row.original.loanChange}</Typography>
  </Stack>
)
