import type { Timestamp } from '@curvefi/prices-api/timestamp'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { REFRESH_INTERVAL } from '@ui/lib/time'
import type { ActivityToken, ActivityTokenDelta } from './types'

const PROCESSING_TIMEOUT_MS = REFRESH_INTERVAL['1h']

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

export const getTransactionActions = (txUrl: string) =>
  [{ id: 'view-transaction', label: t`View Transaction`, href: txUrl, size: 'extraSmall', color: 'ghost' }] as const

export type ActivityUsdValueProps = {
  amount: number
  amountUsd: number | Nullish
  timestamp: Timestamp
  isSold?: boolean
}

/** Historical USD prices can arrive after activity amounts. Show Processing for up to one hour. */
export const formatActivityUsdValue = (
  { amount, amountUsd, timestamp, isSold = false }: ActivityUsdValueProps,
  currentDate: Date,
  format: 'usd.amount' | 'usd.notional' = 'usd.notional',
) =>
  amountUsd == null
    ? amount && currentDate.getTime() < timestamp + PROCESSING_TIMEOUT_MS
      ? t`Processing`
      : UNAVAILABLE_NOTATION
    : formatNumber(isSold ? -amountUsd : amountUsd, format)

export const getChangeColor = (amount: number, positive: 'success' | 'error', negative: 'success' | 'error') =>
  amount > 0 ? positive : amount < 0 ? negative : 'textPrimary'

export const getSwapDeltas = (
  sold: Omit<ActivityTokenDelta, 'label'>,
  bought: Omit<ActivityTokenDelta, 'label'>,
): ActivityTokenDelta[] => [
  { ...sold, amount: -sold.amount, label: t`Sold` },
  { ...bought, label: t`Bought` },
]

/** Give each delta row a specific key in case the query updates with new data so rerendering works correctly. */
export const getActivityDeltaKey = (label: string, address: ActivityToken['address'] | undefined, index: number) =>
  JSON.stringify([label, address, index])
