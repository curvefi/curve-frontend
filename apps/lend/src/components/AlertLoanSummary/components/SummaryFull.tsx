import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { format } from '@/components/AlertLoanSummary/utils'

import Item from '@/components/AlertLoanSummary/components/Item'

const SummaryFull = ({
  title,
  pendingMessage,
  receive = '',
  formValueStateCollateral = '',
  userState,
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '', collateral: stateCollateral = '', borrowed: stateBorrowed = '' } = userState ?? {}

  const { balance, returnToWallet } = useMemo(() => {
    let resp = { balance: 0, returnToWallet: [] as { value: number | string; symbol: string }[] }

    if (+receive > 0) {
      const repayTotal = +receive + +stateBorrowed
      resp.balance = +stateDebt - repayTotal

      const returnToWalletCollateral = +stateCollateral - +formValueStateCollateral
      if (returnToWalletCollateral) {
        resp.returnToWallet.push({ value: returnToWalletCollateral, symbol: collateralSymbol })
      }

      const returnToWalletBorrowed = Math.abs(resp.balance) >= 1 ? Math.abs(resp.balance) : 0
      if (returnToWalletBorrowed) {
        resp.returnToWallet.push({ value: returnToWalletBorrowed, symbol: borrowedSymbol })
      }
    } else {
      resp.returnToWallet.push({ value: stateCollateral, symbol: collateralSymbol })
      if (+stateBorrowed - +stateDebt > 0) {
        resp.returnToWallet.push({ value: +stateBorrowed - +stateDebt, symbol: borrowedSymbol })
      }
    }

    return resp
  }, [borrowedSymbol, collateralSymbol, formValueStateCollateral, receive, stateBorrowed, stateCollateral, stateDebt])

  const minWidth = '170px;'

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />

      {+receive > 0 ? (
        <>
          {+stateBorrowed > 0 && (
            <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
          )}
          <Item $minWidth={minWidth} label={t`Receive:`} value={`-${format(receive || '0')} ${borrowedSymbol}`} />
          <Item $isDivider $minWidth={minWidth} label="" value={`${format(balance)} ${borrowedSymbol}`} />
        </>
      ) : +stateBorrowed > 0 ? (
        <>
          <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
          {+stateDebt - +stateBorrowed > 0 && (
            <Item
              $minWidth={minWidth}
              label={t`Wallet:`}
              value={`-${format(+stateDebt - +stateBorrowed)} ${borrowedSymbol}`}
            />
          )}
          <Item $isDivider $minWidth={minWidth} label="" value={`0 ${borrowedSymbol}`} />
        </>
      ) : null}

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

export default SummaryFull
