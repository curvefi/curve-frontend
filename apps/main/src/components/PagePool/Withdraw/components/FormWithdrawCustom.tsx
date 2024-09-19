import React, { useCallback, useEffect } from 'react'

import { total } from '@/entities/withdraw'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'
import networks from '@/networks'

import Box from '@/ui/Box'
import FieldToken from '@/components/PagePool/components/FieldToken'

type Props = {
  expectedAmounts: string[]
  requiredLpToken: string
}

const FormWithdrawCustom: React.FC<Props> = ({ expectedAmounts, requiredLpToken }) => {
  const { rChainId, signerAddress, tokens } = usePoolContext()
  const { isDisabled, formValues, updateFormValues } = useWithdrawContext()

  const { imageBaseUrl } = networks[rChainId]
  const { selected, lpToken, amounts: formAmounts } = formValues

  const handleAmountChange = useCallback(
    (value: string, idx: number) => {
      updateFormValues({
        amount: { value, idx },
        lpToken: '',
        selected: 'custom-amounts',
      })
    },
    [updateFormValues]
  )

  useEffect(() => {
    if (selected !== 'custom-lpToken' || !Number(lpToken) || !expectedAmounts.length) return

    const updatedAmounts = formAmounts.map((a, idx) => ({ ...a, value: expectedAmounts[idx] }))
    updateFormValues({ amounts: updatedAmounts })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lpToken, selected, expectedAmounts])

  useEffect(() => {
    if (selected !== 'custom-amounts' || !total(formAmounts) || !Number(requiredLpToken)) return

    updateFormValues({ lpToken: requiredLpToken })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, requiredLpToken, formAmounts])

  return (
    <Box grid gridRowGap="narrow">
      {selected.startsWith('custom') &&
        tokens.map(({ symbol, address, ethAddress, haveSameTokenName }, idx) => {
          const formAmount = formAmounts[idx].value ?? ''

          return (
            <FieldToken
              key={address}
              idx={idx}
              amount={formAmount}
              balance={''}
              balanceLoading={false}
              disableInput={isDisabled}
              disableMaxButton={isDisabled}
              hasError={false}
              haveSigner={!!signerAddress}
              haveSameTokenName={haveSameTokenName}
              isWithdraw
              imageBaseUrl={imageBaseUrl}
              token={symbol}
              tokenAddress={ethAddress || address}
              handleAmountChange={handleAmountChange}
              hideMaxButton
              handleMaxClick={() => {}}
            />
          )
        })}
    </Box>
  )
}

export default FormWithdrawCustom
