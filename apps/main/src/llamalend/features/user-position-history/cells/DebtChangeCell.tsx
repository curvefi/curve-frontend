import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

export const DebtChangeCell = ({
  row: {
    original: { loanChange, borrowToken },
  },
}: CellContext<ParsedUserCollateralEvent, any>) => (
  <Stack height={Spacing.xl} paddingY={Spacing.xxs} paddingX={Spacing.sm}>
    <Typography
      variant="tableCellMBold"
      color={loanChange === 0 || loanChange == null ? 'textPrimary' : loanChange > 0 ? 'error' : 'success'}
    >
      {loanChange > 0 ? '+' : ''}
      {loanChange !== 0 ? formatNumber(loanChange) : '-'}{' '}
      {loanChange != null && loanChange !== 0 && borrowToken?.symbol}
    </Typography>
  </Stack>
)
