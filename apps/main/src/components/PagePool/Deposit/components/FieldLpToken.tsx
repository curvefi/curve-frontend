import React from 'react'

import { formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useStakeContext } from '@/components/PagePool/Deposit/contextStake'

import FieldLpTokenComp from '@/components/PagePool/components/FieldLpToken'

const FieldLpToken = () => {
  const { signerAddress, signerPoolBalances, signerPoolBalancesIsLoading } = usePoolContext()
  const { formValues, isDisabled, updateFormValues } = useStakeContext()

  const { lpToken, lpTokenError } = formValues

  const lpTokenBalance = signerPoolBalances?.['lpToken'] ?? ''

  return (
    <FieldLpTokenComp
      amount={lpToken}
      balance={formatNumber(lpTokenBalance, { defaultValue: '-' })}
      balanceLoading={signerPoolBalancesIsLoading}
      hasError={!!lpTokenError}
      haveSigner={!!signerAddress}
      handleAmountChange={(lpToken) => updateFormValues({ lpToken })}
      disabledMaxButton={isDisabled}
      disableInput={isDisabled}
      handleMaxClick={() => updateFormValues({ lpToken: lpTokenBalance })}
    />
  )
}

export default FieldLpToken
