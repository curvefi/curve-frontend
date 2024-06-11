import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'

import { BN } from '@/ui/utils'
import { format } from '@/components/AlertLoanSummary/utils'

import Item from '@/components/AlertLoanSummary/components/Item'

const SummarySelfLiquidate = ({
  pendingMessage,
  title,
  userState,
  userWallet,
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '0', collateral: stateCollateral = '0', borrowed: stateBorrowed = '0' } = userState ?? {}
  const { borrowed: walletBorrowed = '0' } = userWallet ?? {}

  const walletAmount = useMemo(() => {
    const amountNeeded = +stateDebt - +stateBorrowed
    const amountNeededFromWallet = amountNeeded > 0 ? amountNeeded : 0

    return amountNeededFromWallet > 0
      ? BN(amountNeededFromWallet).isGreaterThan(walletBorrowed)
        ? walletBorrowed
        : amountNeededFromWallet
      : 0
  }, [stateBorrowed, stateDebt, walletBorrowed])

  const returnToWallet = useMemo(() => {
    let amounts = [] as { value: string | number; symbol: string }[]

    // return to wallet from state collateral
    if (+stateCollateral > 0) {
      amounts.push({ value: stateCollateral, symbol: collateralSymbol })
    }

    // return to wallet from state borrowed
    const returnToWalletStateBorrowed = +stateBorrowed - +stateDebt
    if (returnToWalletStateBorrowed > 0) {
      amounts.push({ value: returnToWalletStateBorrowed, symbol: borrowedSymbol })
    }
    return amounts
  }, [borrowedSymbol, collateralSymbol, stateBorrowed, stateCollateral, stateDebt])

  const minWidth = '170px'

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />
      {+stateBorrowed > 0 && (
        <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
      )}

      {+walletAmount > 0 && (
        <Item $minWidth={minWidth} label={t`Wallet:`} value={`-${format(walletAmount)} ${borrowedSymbol}`} />
      )}

      {returnToWallet.map(({ value, symbol }, idx) => {
        const isFirst = idx === 0
        return (
          <Item
            key={symbol}
            {...(isFirst ? { $marginTop: 'var(--spacing-3)' } : {})}
            $minWidth={minWidth}
            label={isFirst ? t`Return to wallet ≈` : ''}
            value={`${format(value)} ${symbol}`}
          />
        )
      })}
    </>
  )
}

export default SummarySelfLiquidate
