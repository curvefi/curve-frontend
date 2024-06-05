import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { format } from '@/components/AlertLoanSummary/utils'

import Item from '@/components/AlertLoanSummary/components/Item'

const SummaryPartial = ({
  title,
  pendingMessage,
  receive = '',
  formValueUserBorrowed = '',
  userState,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '0' } = userState ?? {}

  const balance = +stateDebt - +formValueUserBorrowed
  const minWidth = '190px'

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      {+receive > 0 ? (
        <>
          <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />
          <Item
            $minWidth={minWidth}
            label={t`Receive:`}
            value={`${+receive > 0 ? '-' : ''}${format(receive)} ${borrowedSymbol}`}
          />
          <Item
            $minWidth={minWidth}
            $isDivider
            label={t`Debt balance:`}
            value={`${format(+stateDebt - +receive)} ${borrowedSymbol}`}
          />
        </>
      ) : (
        <>
          <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />
          <Item
            $minWidth={minWidth}
            label={t`Wallet:`}
            value={`${+formValueUserBorrowed > 0 ? '-' : ''}${format(formValueUserBorrowed)} ${borrowedSymbol}`}
          />
          <Item
            $minWidth={minWidth}
            $isDivider
            label={t`Debt balance:`}
            value={`${format(balance)} ${borrowedSymbol}`}
          />
        </>
      )}
    </>
  )
}

export default SummaryPartial
