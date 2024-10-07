import { t } from '@lingui/macro'
import React from 'react'
import Item from '@/components/AlertLoanSummary/components/Item'
import type { SummaryProps } from '@/components/AlertLoanSummary/types'


import { format } from '@/components/AlertLoanSummary/utils'


const SummaryCreate = ({
  title,
  pendingMessage,
  receive = '',
  formValueStateDebt = '',
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => {
  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item label={t`Debt:`} value={`${format(formValueStateDebt)} ${borrowedSymbol}`} />
      <Item label={t`Collateral:`} value={`${format(receive)} ${collateralSymbol}`} />
    </>
  )
}

export default SummaryCreate
