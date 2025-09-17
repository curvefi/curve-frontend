import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserLendCollateralEvent } from '../hooks/useUserLendCollateralEvents'

const { Spacing } = SizesAndSpaces

export const CollateralChangeCell = ({
  row: {
    original: { collateralChange, collateralChangeUsd, collateralToken },
  },
}: CellContext<ParsedUserLendCollateralEvent, any>) => (
  <Stack paddingTop={Spacing.sm} paddingBottom={Spacing.sm} paddingRight={Spacing.sm}>
    <Typography
      variant="tableCellSBold"
      color={
        collateralChange === 0 || collateralChange == null ? 'textPrimary' : collateralChange > 0 ? 'success' : 'error'
      }
    >
      {collateralChange > 0 ? '+' : ''}
      {collateralChange === 0 ? '-' : formatNumber(collateralChange, { currency: 'USD' })}{' '}
      {collateralChange != null && collateralChangeUsd !== 0 && collateralToken?.symbol}
    </Typography>
    {collateralChangeUsd !== 0 && (
      <Typography variant="bodyXsRegular">{formatNumber(collateralChangeUsd, { currency: 'USD' })}</Typography>
    )}
  </Stack>
)
