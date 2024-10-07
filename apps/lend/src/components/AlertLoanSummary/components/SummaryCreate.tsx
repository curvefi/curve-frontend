import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import React from 'react'
import { t } from '@lingui/macro'

import { format } from '@/components/AlertLoanSummary/utils'

import Item from '@/components/AlertLoanSummary/components/Item'

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
