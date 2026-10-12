import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import type { Timestamp } from '@curvefi/prices-api/timestamp'
import { scanTxPath } from '@legacy-ui/utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { type Nullish, maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { REFRESH_INTERVAL } from '@ui/lib/time'
import type { ActivityTokenDelta, MarketEventRow } from './types'

const PROCESSING_TIMEOUT_MS = REFRESH_INTERVAL['1h']

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

export const getVaultEventChange = ({ deposit, withdrawal }: VaultEvent) => {
  const sign = deposit ? 1 : -1
  return { amounts: deposit ?? withdrawal, sign, valueColor: sign > 0 ? 'success' : 'error' } as const
}
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
) =>
  amountUsd == null
    ? amount && currentDate.getTime() < timestamp + PROCESSING_TIMEOUT_MS
      ? t`Processing`
      : UNAVAILABLE_NOTATION
    : formatNumber(isSold ? -amountUsd : amountUsd, 'usd.notional')

export const getChangeColor = (amount: number, positive: 'success' | 'error', negative: 'success' | 'error') =>
  amount > 0 ? positive : amount < 0 ? negative : 'textPrimary'

/** Formats the USD value of a single token delta, negative when the tokens go out */
export const formatTokenDeltaUsd = ({ amount, amountUsd, timestamp }: ActivityTokenDelta, currentDate: Date) =>
  formatActivityUsdValue({ amount, amountUsd, timestamp, isSold: amount < 0 }, currentDate)

export const getLlammaEventAction = ({ type }: MarketEventRow) =>
  ({
    deposit: { label: t`Deposit`, color: 'success' as const },
    withdrawal: { label: t`Withdraw`, color: 'error' as const },
  })[type]

/** Lists the token deltas of a LLAMMA event: the deposited collateral, or the withdrawn collateral and borrowed tokens */
export const getLlammaEventTokenDeltas = (event: MarketEventRow): ActivityTokenDelta[] => {
  const { timestamp, blockchainId, collateralToken, borrowToken } = event
  switch (event.type) {
    case 'deposit': {
      const { amount, amountUsd } = event.deposit
      return [{ label: t`Amount`, token: collateralToken, blockchainId, amount, amountUsd, timestamp }]
    }
    case 'withdrawal': {
      const { amountCollateral, amountCollateralUsd, amountBorrowed, amountBorrowedUsd } = event.withdrawal
      return notFalsy(
        !!amountCollateral && {
          label: t`Collateral`,
          token: collateralToken,
          blockchainId,
          amount: -amountCollateral,
          amountUsd: amountCollateralUsd,
          timestamp,
        },
        !!amountBorrowed && {
          label: t`Borrowed`,
          token: borrowToken,
          blockchainId,
          amount: -amountBorrowed,
          amountUsd: amountBorrowedUsd,
          timestamp,
        },
      )
    }
  }
}
