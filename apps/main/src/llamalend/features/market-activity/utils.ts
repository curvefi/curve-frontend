import { sumBy } from 'lodash'
import type { ActivityRow, ActivityTokenDelta } from '@evm-ui/features/activity-table/types'
import { getSwapDeltas, SWAP_BREAKDOWN_CUTOFF } from '@evm-ui/features/activity-table/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import type { MarketBorrowEventRow, MarketSupplyEventRow, MarketTradeRow } from './types'

const getMarketBorrowEventDeltas = (event: MarketBorrowEventRow): ActivityTokenDelta[] => {
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
  valueUsd: null,
  deltas: getSwapDeltas(
    { token: tokenSold, amount: amountSold, amountUsd: null },
    { token: tokenBought, amount: amountBought, amountUsd: null },
  ),
})

export const toMarketActivityBorrowEventRow = (event: MarketBorrowEventRow): ActivityRow => {
  const { chainId, blockchainId, txHash, timestamp, provider: address, type } = event
  const deltas = getMarketBorrowEventDeltas(event)
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

const SUPPLY_BREAKDOWN_CUTOFF = SWAP_BREAKDOWN_CUTOFF // Almost all supply events have 2 deltas, so we can use the same cutoff as swaps.

export const toMarketActivitySupplyEventRow = ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  provider: address,
  deposit,
  withdrawal,
  borrowToken,
  vaultToken,
}: MarketSupplyEventRow): ActivityRow => {
  const amounts = deposit ?? withdrawal
  const assetSign = deposit ? -1 : 1
  const action: ActivityRow['action'] = deposit
    ? { label: t`Deposit`, color: 'success' }
    : withdrawal
      ? { label: t`Withdrawal`, color: 'error' }
      : { label: '' }

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action,
    valueUsd: null,
    breakdownCutoff: SUPPLY_BREAKDOWN_CUTOFF,
    deltas: amounts
      ? [
          { label: t`Assets`, token: borrowToken, amount: assetSign * amounts.assets, amountUsd: null },
          { label: t`Shares`, token: vaultToken, amount: -assetSign * amounts.shares, amountUsd: null },
        ]
      : [],
  }
}
