import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

export const CollateralChangeCell = ({
  row: {
    original: { collateralChange, collateralChangeUsd, collateralToken },
  },
}: CellContext<ParsedUserCollateralEvent, any>) => (
  <Stack paddingTop={Spacing.sm} paddingBottom={Spacing.sm} paddingRight={Spacing.sm}>
    <Typography
      variant="tableCellMBold"
      color={
        collateralChange === 0 || collateralChange == null ? 'textPrimary' : collateralChange > 0 ? 'success' : 'error'
      }
    >
      {collateralChange > 0 ? '+' : ''}
      {collateralChange === 0 ? '-' : formatNumber(collateralChange)}{' '}
      {collateralChange != null && collateralChange !== 0 && collateralChangeUsd !== 0 && collateralToken?.symbol}
    </Typography>
    {collateralChangeUsd !== 0 && collateralChangeUsd !== null && (
      <Typography variant="bodySRegular">{formatNumber(collateralChangeUsd, { currency: 'USD' })}</Typography>
    )}
  </Stack>
)
