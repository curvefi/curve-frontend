import { sumBy } from 'lodash'
import type { ActivityRow, ActivityTokenDelta } from '@evm-ui/features/activity-table/types'
import { getSwapDeltas, SWAP_BREAKDOWN_CUTOFF } from '@evm-ui/features/activity-table/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow, MarketTradeRow } from './types'

const getMarketEventDeltas = (event: MarketEventRow): ActivityTokenDelta[] => {
  if (event.type === 'deposit') {
    const { amount, amountUsd } = event.deposit
    return notFalsy(!!amount && { label: t`Collateral`, token: event.collateralToken, amount, amountUsd })
  }

  const { amountCollateral, amountCollateralUsd, amountBorrowed, amountBorrowedUsd } = event.withdrawal
  return notFalsy(
    !!amountCollateral && {
      label: t`Collateral`,
      token: event.collateralToken,
      amount: -amountCollateral,
      amountUsd: maybe(amountCollateralUsd, x => -x) ?? null,
    },
    !!amountBorrowed && {
      label: t`Borrowed`,
      token: event.borrowToken,
      amount: -amountBorrowed,
      amountUsd: maybe(amountBorrowedUsd, x => -x) ?? null,
    },
  )
}

export const toMarketActivitySwapRow = ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  buyer: address,
  amountSold,
  tokenSold,
  amountBought,
  tokenBought,
}: MarketTradeRow): ActivityRow => ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  address,
  action: { label: t`Swap` },
  breakdownCutoff: SWAP_BREAKDOWN_CUTOFF,
  valueUsd: maybe(amountBought, Math.abs) ?? null,
  deltas: getSwapDeltas(
    { token: tokenSold, amount: amountSold, amountUsd: null },
    { token: tokenBought, amount: amountBought, amountUsd: null },
  ),
})

export const toMarketActivityEventRow = (event: MarketEventRow): ActivityRow => {
  const { chainId, blockchainId, txHash, timestamp, provider: address, type } = event
  const deltas = getMarketEventDeltas(event)
  const valueUsd =
    deltas.length && deltas.every(({ amountUsd }) => amountUsd != null)
      ? sumBy(deltas, ({ amountUsd }) => Math.abs(amountUsd ?? 0))
      : null

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action: type === 'deposit' ? { label: t`Deposit`, color: 'success' } : { label: t`Withdraw`, color: 'error' },
    valueUsd: type === 'deposit' ? valueUsd : (maybe(valueUsd, x => -x) ?? null),
    deltas,
  }
}
