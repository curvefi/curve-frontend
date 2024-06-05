import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import { t } from '@lingui/macro'
import React from 'react'

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

  const amountNeededFromWallet = +stateDebt - +stateBorrowed
  const walletAmount = amountNeededFromWallet - +walletBorrowed <= 0 ? amountNeededFromWallet : +walletBorrowed
  const remainingBalance = +stateDebt - +stateBorrowed - +walletAmount
  const minWidth = '180px'

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />
      <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
      <Item $minWidth={minWidth} label={t`Wallet:`} value={`-${format(walletAmount)} ${borrowedSymbol}`} />
      <Item
        $isDivider
        $minWidth={minWidth}
        label={remainingBalance > 0 ? t`Debt balance:` : ''}
        value={`${format(remainingBalance)} ${borrowedSymbol}`}
      />

      {remainingBalance === 0 && (
        <Item
          $marginTop="var(--spacing-3)"
          $minWidth={minWidth}
          label={t`Return to wallet:`}
          value={`${format(stateCollateral)} ${collateralSymbol}`}
        />
      )}
    </>
  )
}

export default SummarySelfLiquidate
