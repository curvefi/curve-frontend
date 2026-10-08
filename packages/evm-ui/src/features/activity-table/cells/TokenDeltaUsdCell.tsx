import { sumBy } from 'lodash'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import type { ActivityTokenDelta } from '../types'
import { formatTokenDeltaUsd } from '../utils'

const formatTotalDeltaUsd = (deltas: readonly ActivityTokenDelta[], currentDate: Date) => {
  const missing = deltas.find(({ amountUsd }) => amountUsd == null)
  return missing
    ? formatTokenDeltaUsd(missing, currentDate)
    : formatNumber(
        sumBy(deltas, ({ amount, amountUsd }) => Math.sign(amount) * (amountUsd ?? 0)),
        'usd.notional',
      )
}

/** Shows the USD value of the token deltas, summed when there are multiple deltas */
export const TokenDeltaUsdCell = ({ deltas }: { deltas: readonly ActivityTokenDelta[] }) => {
  const currentDate = useCurrentDate()
  return (
    <InlineTableCell>
      {!!deltas.length && <Typography variant="tableCellValue">{formatTotalDeltaUsd(deltas, currentDate)}</Typography>}
    </InlineTableCell>
  )
}
