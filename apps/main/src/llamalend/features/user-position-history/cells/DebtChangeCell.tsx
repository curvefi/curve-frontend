import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserLendCollateralEvent } from '../hooks/useUserLendCollateralEvents'

const { Spacing } = SizesAndSpaces

export const DebtChangeCell = ({ row }: CellContext<ParsedUserLendCollateralEvent, any>) => (
  <Stack paddingTop={Spacing.sm} paddingBottom={Spacing.sm} paddingRight={Spacing.sm}>
    <Typography
      variant="tableCellSBold"
      color={
        row.original.loanChange === 0 || row.original.loanChange == null
          ? 'textPrimary'
          : row.original.loanChange > 0
            ? 'error'
            : 'success'
      }
    >
      {row.original.loanChange > 0 ? '+' : ''}
      {formatNumber(row.original.loanChange)} {row.original.loanChange != null && row.original.borrowToken.symbol}
    </Typography>
  </Stack>
)
