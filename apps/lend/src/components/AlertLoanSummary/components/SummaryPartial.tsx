import { t } from '@lingui/macro'
import React from 'react'
import Item from '@/components/AlertLoanSummary/components/Item'
import type { SummaryProps } from '@/components/AlertLoanSummary/types'


import { format } from '@/components/AlertLoanSummary/utils'


const SummaryPartial = ({
  title,
  pendingMessage,
  receive = '',
  formValueUserBorrowed = '',
  userState,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '0', borrowed: stateBorrowed = '0' } = userState ?? {}

  const minWidth = '190px'

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
          <Item $minWidth={minWidth} label={t`Receive:`} value={`-${format(receive)} ${borrowedSymbol}`} />
          <Item
            $minWidth={minWidth}
            $isDivider
            label={t`Debt balance:`}
            value={`${format(+stateDebt - (+receive + +stateBorrowed))} ${borrowedSymbol}`}
          />
        </>
      ) : (
        <>
          {+stateBorrowed > 0 && (
            <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
          )}
          <Item
            $minWidth={minWidth}
            label={t`Wallet:`}
            value={`${+formValueUserBorrowed > 0 ? '-' : ''}${format(formValueUserBorrowed)} ${borrowedSymbol}`}
          />
          <Item
            $minWidth={minWidth}
            $isDivider
            label={t`Debt balance:`}
            value={`${format(+stateDebt - (+stateBorrowed + +formValueUserBorrowed))} ${borrowedSymbol}`}
          />
        </>
      )}
    </>
  )
}

export default SummaryPartial
