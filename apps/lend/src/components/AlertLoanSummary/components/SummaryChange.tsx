import type { SummaryProps } from '@/components/AlertLoanSummary/types'

import { t } from '@lingui/macro'
import React from 'react'

import { format } from '@/components/AlertLoanSummary/utils'

import Icon from '@/ui/Icon'
import Item from '@/components/AlertLoanSummary/components/Item'

const SummaryChange = ({
  title,
  pendingMessage,
  borrowedSymbol,
  collateralSymbol,
  receive = '0',
  formValueStateDebt = '0',
  userState,
}: SummaryProps) => {
  const { debt: stateDebt = '0', collateral: stateCollateral = '0' } = userState ?? {}

  const newDebt = +stateDebt + +formValueStateDebt
  const showDebt = +stateDebt !== newDebt

  const newStateCollateral = +stateCollateral + +receive
  const showCollateral = +stateCollateral !== newStateCollateral

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item
        label={t`Debt:`}
        value={
          <>
            {showDebt && (
              <>
                {format(stateDebt)} <Icon size={16} name="ArrowRight" />
              </>
            )}{' '}
            {format(newDebt)} {borrowedSymbol}
          </>
        }
      />
      <Item
        label={t`Collateral:`}
        value={
          <>
            {showCollateral && (
              <>
                {format(stateCollateral)} <Icon size={16} name="ArrowRight" />
              </>
            )}
            {format(newStateCollateral)} {collateralSymbol}
          </>
        }
      />
    </>
  )
}

export default SummaryChange
