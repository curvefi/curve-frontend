import type { WithdrawFormValues } from '@/entities/withdraw'

import React, { useCallback } from 'react'

import { formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'

import FieldLpTokenComp from '@/components/PagePool/components/FieldLpToken'

const FieldLpToken = () => {
  const { signerAddress, signerPoolBalances, signerPoolBalancesIsLoading, tokens } = usePoolContext()
  const { formValues, isDisabled, updateFormValues } = useWithdrawContext()

  const { selected, lpToken, lpTokenError } = formValues

  const lpTokenBalance = signerPoolBalances?.['lpToken'] ?? ''

  const handleChangeLpToken = useCallback(
    (lpToken: string) => {
      let updatedFormValues: Partial<WithdrawFormValues> = {}

      if (selected === 'custom-amounts') {
        updatedFormValues.selected = 'custom-lpToken'
      }

      if (!selected && tokens.length > 0) {
        updatedFormValues.selected = 'one-coin'
        updatedFormValues.selectedToken = tokens[0].symbol
        updatedFormValues.selectedTokenAddress = tokens[0].address
      }

      let lpTokenError: WithdrawFormValues['lpTokenError'] = ''
      if (signerAddress) lpTokenError = Number(lpToken) > Number(lpTokenBalance) ? 'too-much' : ''

      updateFormValues({ lpToken, lpTokenError, ...updatedFormValues })
    },
    [lpTokenBalance, selected, signerAddress, tokens, updateFormValues]
  )

  return (
    <FieldLpTokenComp
      amount={lpToken}
      balanceLoading={signerPoolBalancesIsLoading}
      balance={formatNumber(lpTokenBalance, { defaultValue: '-' })}
      hasError={!!lpTokenError}
      haveSigner={!!signerAddress}
      handleAmountChange={handleChangeLpToken}
      disableInput={isDisabled}
      disabledMaxButton={isDisabled}
      handleMaxClick={() => handleChangeLpToken(lpTokenBalance)}
    />
  )
}

export default FieldLpToken
