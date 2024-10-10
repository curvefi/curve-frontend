import { useCallback } from 'react'
import { t } from '@lingui/macro'

import { useDepositContext } from '@/components/PagePool/Deposit/contextDeposit'

import { FieldsWrapper } from '@/components/PagePool/styles'
import Checkbox from '@/ui/Checkbox'
import { usePoolContext } from '@/components/PagePool/contextPool'

const DepositCheckBalancedAmount = () => {
  const { isSeed } = usePoolContext()
  const { formValues, isDisabled: formIsDisabled, updateFormValues } = useDepositContext()

  const { amounts, isBalancedAmounts } = formValues

  const isDisabled = formIsDisabled || !!isSeed

  const handleBalancedAmountsCheck = useCallback(
    (isBalancedAmounts: boolean) => {
      updateFormValues({
        isBalancedAmounts,
        amounts: amounts.map((a) => ({
          ...a,
          value: isBalancedAmounts ? '' : a.value,
          error: '',
        })),
      })
    },
    [amounts, updateFormValues]
  )

  return (
    <FieldsWrapper>
      <Checkbox isDisabled={isDisabled} isSelected={isBalancedAmounts} onChange={handleBalancedAmountsCheck}>
        {t`Add all coins in a balanced proportion`}
      </Checkbox>
    </FieldsWrapper>
  )
}

export default DepositCheckBalancedAmount
