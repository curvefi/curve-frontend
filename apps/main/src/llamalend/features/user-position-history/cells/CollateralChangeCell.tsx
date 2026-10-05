import { formatActivityUsdValue } from '@evm-ui/features/activity-table/utils'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

export const CollateralChangeCell = ({
  row: {
    original: { collateralChange, collateralChangeUsd, collateralToken, timestamp },
  },
}: CellContext<CurveTableFeatures, ParsedUserCollateralEvent, ParsedUserCollateralEvent['collateralChange']>) => {
  const currentDate = useCurrentDate()
  return (
    <InlineTableCell>
      <Typography
        variant="tableCellMBold"
        color={collateralChange ? (collateralChange > 0 ? 'success' : 'error') : 'textPrimary'}
      >
        {notFalsy(
          formatNumber(collateralChange || null, 'token.delta'),
          collateralChange && collateralToken?.symbol,
        ).join(' ')}
      </Typography>
      {!!collateralChange && (
        <Typography variant="bodySRegular">
          {formatActivityUsdValue({ amount: collateralChange, amountUsd: collateralChangeUsd, timestamp }, currentDate)}
        </Typography>
      )}
    </InlineTableCell>
  )
}
