import { formatActivityUsdValue } from '@evm-ui/features/activity-table/utils'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
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
  const currentTime = useCurrentDate().getTime()
  return (
    <InlineTableCell>
      <Typography
        variant="tableCellMBold"
        color={
          collateralChange === 0 || collateralChange == null
            ? 'textPrimary'
            : collateralChange > 0
              ? 'success'
              : 'error'
        }
      >
        {collateralChange > 0 ? '+' : ''}
        {collateralChange === 0 ? '-' : formatNumber(collateralChange, { abbreviate: false })}{' '}
        {collateralChange != null && collateralChange !== 0 && collateralToken?.symbol}
      </Typography>
      {collateralChange !== 0 && (
        <Typography variant="bodySRegular">
          {formatActivityUsdValue({ amount: collateralChange, amountUsd: collateralChangeUsd, timestamp }, currentTime)}
        </Typography>
      )}
    </InlineTableCell>
  )
}
