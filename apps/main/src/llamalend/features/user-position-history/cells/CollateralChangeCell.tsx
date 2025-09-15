import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserLendCollateralEvent } from '../hooks/useUserLendCollateralEvents'

const { Spacing } = SizesAndSpaces

export const CollateralChangeCell = ({ row }: CellContext<ParsedUserLendCollateralEvent, any>) => (
  <Stack paddingTop={Spacing.sm} paddingBottom={Spacing.sm} paddingRight={Spacing.sm}>
    <Typography
      variant="tableCellSBold"
      color={
        row.original.collateralChange === 0 || row.original.collateralChange == null
          ? 'textPrimary'
          : row.original.collateralChange > 0
            ? 'success'
            : 'error'
      }
    >
      {row.original.collateralChange > 0 ? '+' : ''}
      {formatNumber(row.original.collateralChange)}{' '}
      {row.original.collateralChange != null && row.original.collateralToken.symbol}
    </Typography>
    <Typography variant="bodyXsRegular">
      {formatNumber(row.original.collateralChangeUsd, { currency: 'USD' })}
    </Typography>
  </Stack>
)
