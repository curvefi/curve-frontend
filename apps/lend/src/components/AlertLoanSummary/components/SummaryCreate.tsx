import type { SummaryProps } from '@lend/components/AlertLoanSummary/types'

import React from 'react'
import { t } from '@lingui/macro'

import { format } from '@lend/components/AlertLoanSummary/utils'

import Item from '@lend/components/AlertLoanSummary/components/Item'

const SummaryCreate = ({
  title,
  pendingMessage,
  receive = '',
  formValueStateDebt = '',
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => (
  <>
    <strong>{pendingMessage}</strong>

    {title}

    <Item label={t`Debt:`} value={`${format(formValueStateDebt)} ${borrowedSymbol}`} />
    <Item label={t`Collateral:`} value={`${format(receive)} ${collateralSymbol}`} />
  </>
)

export default SummaryCreate
