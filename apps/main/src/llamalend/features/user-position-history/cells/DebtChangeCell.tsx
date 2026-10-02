import { formatActivityUsdValue } from '@evm-ui/features/activity-table/utils'
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
  const currentTime = useCurrentDate().getTime()
  return (
    <InlineTableCell>
      <Typography variant="tableCellMBold" color={loanChange ? (loanChange > 0 ? 'error' : 'success') : 'textPrimary'}>
        {notFalsy(formatNumber(loanChange || null, 'token.change'), loanChange && borrowToken?.symbol).join(' ')}
      </Typography>
      {loanChange !== 0 && (
        <Typography variant="bodySRegular">
          {formatActivityUsdValue({ amount: loanChange, amountUsd: loanChangeUsd, timestamp }, currentTime)}
        </Typography>
      )}
    </InlineTableCell>
  )
}
