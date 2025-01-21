import type { SummaryProps } from '@lend/components/AlertLoanSummary/types'

import React from 'react'
import { t } from '@lingui/macro'

import { format } from '@lend/components/AlertLoanSummary/utils'

import Item from '@lend/components/AlertLoanSummary/components/Item'

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
