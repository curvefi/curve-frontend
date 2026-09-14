import type { Timestamp } from '@curvefi/prices-api/timestamp'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import { REFRESH_INTERVAL } from '@ui/lib/time'

const PROCESSING_TIMEOUT_MS = REFRESH_INTERVAL['1h']

/**
 * The backend fetches historical USD prices asynchronously and fills them in retroactively, so activity amounts can
 * arrive before their USD values. Show Processing for up to one hour, then the unavailable notation.
 */
export const ActivityUsdValue = ({
  amount,
  amountUsd,
  timestamp,
  isSold = false,
}: {
  amount: number
  amountUsd: number | null
  timestamp: Timestamp
  isSold?: boolean
}) => {
  const currentTime = useCurrentDate().getTime()

  return amountUsd == null
    ? amount !== 0 && currentTime < timestamp + PROCESSING_TIMEOUT_MS
      ? t`Processing`
      : UNAVAILABLE_NOTATION
    : formatNumber(isSold ? -amountUsd : amountUsd, 'usd.notional')
}
