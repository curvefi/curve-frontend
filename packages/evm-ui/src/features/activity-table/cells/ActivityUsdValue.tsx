import type { Timestamp } from '@curvefi/prices-api/timestamp'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import { REFRESH_INTERVAL } from '@ui/lib/time'
import { ActivityUsdValueProps, formatActivityUsdValue } from '../utils'
import { Nullish } from '@primitives/objects.utils'

export const ActivityUsdValue = ({ amount, amountUsd, timestamp, isSold }: ActivityUsdValueProps) =>
  formatActivityUsdValue({ amount, amountUsd, timestamp, isSold }, useCurrentDate().getTime())
