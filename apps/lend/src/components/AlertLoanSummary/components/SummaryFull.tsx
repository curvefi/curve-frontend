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
  formValueUserBorrowed = '',
  userState,
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '', collateral: stateCollateral = '' } = userState ?? {}

  const returnToWallet = useMemo(() => {
    return [
      {
        ...(+receive > 0
          ? { value: +receive - +stateDebt, symbol: borrowedSymbol }
          : { value: +formValueUserBorrowed - +stateDebt, symbol: borrowedSymbol }),
      },
      { value: +stateCollateral - +formValueStateCollateral, symbol: collateralSymbol },
    ].filter(({ value }) => +value > 0)
  }, [
    borrowedSymbol,
    collateralSymbol,
    formValueStateCollateral,
    formValueUserBorrowed,
    receive,
    stateCollateral,
    stateDebt,
  ])

  const balance = +stateDebt - +receive - +formValueUserBorrowed
  const minWidth = '170px;'

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />
      {+receive > 0 ? (
        <Item $minWidth={minWidth} label={t`Receive:`} value={`-${format(receive || '0')} ${borrowedSymbol}`} />
      ) : (
        <Item
          $minWidth={minWidth}
          label={t`Wallet:`}
          value={`${formValueUserBorrowed ? '-' : ''}${format(formValueUserBorrowed)} ${borrowedSymbol}`}
        />
      )}
      <Item $isDivider $minWidth={minWidth} label="" value={`${format(balance)} ${borrowedSymbol}`} />

      {returnToWallet.map(({ value, symbol }, idx) => {
        const isFirst = idx === 0
        return (
          <Item
            key={symbol}
            {...(isFirst ? { $marginTop: 'var(--spacing-3)' } : {})}
            $minWidth={minWidth}
            label={isFirst ? t`Return to wallet:` : ''}
            value={`${format(value)} ${symbol}`}
          />
        )
      })}
    </>
  )
}

export default SummaryFull
