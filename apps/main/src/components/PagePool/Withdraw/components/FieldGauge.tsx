import React from 'react'

import { formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useUnstakeContext } from '@/components/PagePool/Withdraw/contextUnstake'

import FieldLpToken from '@/components/PagePool/components/FieldLpToken'

const FieldGauge = () => {
  const { signerAddress, signerPoolBalances, signerPoolBalancesIsLoading } = usePoolContext()
  const { formValues, isLoading, isDisabled, updateFormValues } = useUnstakeContext()

  const { gauge, gaugeError } = formValues

  const gaugeBalance = signerPoolBalances?.['gauge']

  return (
    <FieldLpToken
      amount={gauge}
      balanceLoading={isLoading || signerPoolBalancesIsLoading}
      balance={formatNumber(gaugeBalance, { defaultValue: '-' })}
      hasError={!!gaugeError}
      haveSigner={!!signerAddress}
      handleAmountChange={(gauge) => updateFormValues({ gauge })}
      disabledMaxButton={isDisabled}
      disableInput={isDisabled}
      handleMaxClick={() => updateFormValues({ gauge: gaugeBalance })}
    />
  )
}

export default FieldGauge
