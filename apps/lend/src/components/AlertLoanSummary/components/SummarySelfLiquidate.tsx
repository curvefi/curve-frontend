import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'

import { isGreaterThan, minus, getDecimalLength, formatUnits } from '@/shared/curve-lib'
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
  const { borrowed: walletBorrowed } = userWallet ?? {}

  const walletAmount = useMemo(() => {
    if (typeof walletBorrowed === 'undefined') return '0'

    const borrowedTokenDecimal = getDecimalLength(walletBorrowed)
    const amountNeeded = minus(stateDebt, stateBorrowed, borrowedTokenDecimal)
    const amountNeededFromWallet = amountNeeded > 0n ? amountNeeded : 0n

    return amountNeededFromWallet > 0n
      ? isGreaterThan(amountNeededFromWallet, walletBorrowed, getDecimalLength(walletBorrowed))
        ? walletBorrowed
        : formatUnits(amountNeededFromWallet, borrowedTokenDecimal)
      : '0'
  }, [stateBorrowed, stateDebt, walletBorrowed])

  const returnToWallet = useMemo(() => {
    let amounts: { value: string | number; symbol: string }[] = []

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
