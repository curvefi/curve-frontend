import type { Timestamp } from '@curvefi/prices-api/timestamp'
import { scanTxPath } from '@legacy-ui/utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { type Nullish, maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { REFRESH_INTERVAL } from '@ui/lib/time'
import type { ActivityTokenDelta } from './types'

const PROCESSING_TIMEOUT_MS = REFRESH_INTERVAL['1h']

/** Required amount of deltas before breakdown rows are being shown. */
export const DEFAULT_BREAKDOWN_CUTOFF = 2

/** Swap activity is most often limited to just 2 tokens, which can be represented in the 'amounts' column, so we only show breakdowns for 3+ tokens. */
export const SWAP_BREAKDOWN_CUTOFF = 3

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

export const getTransactionActions = (chainId: number, txHash?: string | null) =>
  notFalsy(
    maybe(
      txHash,
      txHash =>
        ({
          id: 'view-transaction',
          label: t`View Transaction`,
          href: scanTxPath(chainId, txHash),
          size: 'extraSmall',
          color: 'ghost',
        }) as const,
    ),
  )

type ActivityUsdValueProps = { amount: number; amountUsd: number | Nullish; timestamp: Timestamp; isSold?: boolean }

/** Historical USD prices can arrive after activity amounts. Show Processing for up to one hour. */
export const formatActivityUsdValue = (
  { amount, amountUsd, timestamp, isSold = false }: ActivityUsdValueProps,
  currentDate: Date,
) =>
  amountUsd == null
    ? amount && currentDate.getTime() < timestamp + PROCESSING_TIMEOUT_MS
      ? t`Processing`
      : UNAVAILABLE_NOTATION
    : formatNumber(isSold ? -amountUsd : amountUsd, 'usd.notional')

export const getChangeColor = (amount: number, positive: 'success' | 'error', negative: 'success' | 'error') =>
  amount > 0 ? positive : amount < 0 ? negative : 'textPrimary'

export const getSwapDeltas = (
  sold: Omit<ActivityTokenDelta, 'label'>,
  bought: Omit<ActivityTokenDelta, 'label'>,
): ActivityTokenDelta[] =>
  [
    { ...sold, amount: -sold.amount, label: t`Sold` },
    { ...bought, label: t`Bought` },
  ].filter(({ amount }) => amount !== 0)
