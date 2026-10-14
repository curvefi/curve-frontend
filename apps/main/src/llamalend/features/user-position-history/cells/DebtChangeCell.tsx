import { formatActivityUsdValue, getChangeColor } from '@evm-ui/features/activity-table/utils'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'

export const DebtChangeCell = ({
  row: {
    original: { loanChange, loanChangeUsd, borrowToken, timestamp },
  },
}: CellContext<CurveTableFeatures, ParsedUserCollateralEvent, ParsedUserCollateralEvent['loanChange']>) => {
  const currentDate = useCurrentDate()
  return (
    <InlineTableCell>
      <Typography variant="tableCellValue" color={getChangeColor(loanChange, 'error', 'success')}>
        {notFalsy(formatNumber(loanChange || null, 'token.delta'), loanChange && borrowToken?.symbol).join(' ')}
      </Typography>
      {!!loanChange && (
        <Typography variant="tableCellSupport" color="textSecondary">
          {formatActivityUsdValue({ amount: loanChange, amountUsd: loanChangeUsd, timestamp }, currentDate)}
        </Typography>
      )}
    </InlineTableCell>
  )
}
