import React, { useCallback } from 'react'
import styled from 'styled-components'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'

import { RadioGroup } from '@/ui/Radio'
import CheckboxOneCoinAmount from '@/components/PagePool/Withdraw/components/CheckboxOneCoinAmount'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

type Props = {
  expected: string
  isError: boolean
}

const FormWithdrawOneCoin: React.FC<Props> = ({ expected, isError }) => {
  const { tokens } = usePoolContext()
  const { formValues, updateFormValues } = useWithdrawContext()

  const { selectedToken, selectedTokenAddress } = formValues

  const handleSelectWithdrawOptionChange = useCallback(
    (selectedTokenAddress: string) => {
      const selectedToken = tokens.find(({ address }) => address === selectedTokenAddress)?.symbol ?? ''
      updateFormValues({ selectedToken, selectedTokenAddress })
    },
    [tokens, updateFormValues]
  )

  return (
    <StyledRadioGroup
      aria-label="Withdraw from one coin"
      value={selectedTokenAddress}
      onChange={handleSelectWithdrawOptionChange}
    >
      {!selectedTokenAddress && (
        <SpinnerWrapper vSpacing={4}>
          <Spinner />
        </SpinnerWrapper>
      )}

      {selectedTokenAddress &&
        tokens.map((tokenObj, idx) => {
          const isChecked = selectedToken === tokenObj.symbol

          return (
            <CheckboxOneCoinAmount
              key={`${tokenObj.address}${idx}`}
              isChecked={isChecked}
              tokenObj={tokenObj}
              value={isChecked ? (isError ? '?' : expected || '0') : '0'}
            />
          )
        })}
    </StyledRadioGroup>
  )
}

const StyledRadioGroup = styled(RadioGroup)`
  grid-gap: var(--spacing-2);
`

export default FormWithdrawOneCoin
