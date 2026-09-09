import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

export const CollateralChangeCell = ({
  row: {
    original: { collateralChange, collateralChangeUsd, collateralToken },
  },
}: CellContext<CurveTableFeatures, ParsedUserCollateralEvent, ParsedUserCollateralEvent['collateralChange']>) => (
  <InlineTableCell>
    <Typography
      variant="tableCellMBold"
      color={
        collateralChange === 0 || collateralChange == null ? 'textPrimary' : collateralChange > 0 ? 'success' : 'error'
      }
    >
      {collateralChange > 0 ? '+' : ''}
      {collateralChange === 0 ? '-' : formatNumber(collateralChange, { abbreviate: false })}{' '}
      {collateralChange != null && collateralChange !== 0 && collateralChangeUsd !== 0 && collateralToken?.symbol}
    </Typography>
    {collateralChangeUsd !== 0 && collateralChangeUsd !== null && (
      <Typography variant="bodySRegular">{formatNumber(collateralChangeUsd, 'usd.amount')}</Typography>
    )}
  </InlineTableCell>
)
