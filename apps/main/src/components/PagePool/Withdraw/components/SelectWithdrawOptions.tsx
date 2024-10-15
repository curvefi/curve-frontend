import type { WithdrawFormValues } from '@/entities/withdraw'
import type { SelectedType } from '@/entities/withdraw'

import React, { useCallback } from 'react'
import { t } from '@lingui/macro'
import styled, { css } from 'styled-components'

import { mediaQueries } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'

import { Radio, RadioGroup } from '@/ui/Radio'

const SelectWithdrawOptions = () => {
  const { signerAddress, pool, signerPoolBalances, tokens } = usePoolContext()
  const { formValues, isDisabled, updateFormValues } = useWithdrawContext()

  const { amounts: formAmounts, lpToken, selected, selectedToken, selectedTokenAddress } = formValues

  const lpTokenBalance = signerPoolBalances?.['lpToken'] ?? ''

  const handleRadioChange = useCallback(
    (val: string) => {
      const updatedSelected = val as SelectedType

      let lpTokenError: WithdrawFormValues['lpTokenError'] = ''
      if (signerAddress) lpTokenError = Number(lpToken) > Number(lpTokenBalance) ? 'too-much' : ''

      let updatedFormValues: Partial<WithdrawFormValues> = {}

      if (updatedSelected === 'one-coin') {
        updatedFormValues.selected = updatedSelected
        updatedFormValues.selectedToken = selectedToken || tokens[0].symbol
        updatedFormValues.selectedTokenAddress = selectedTokenAddress || tokens[0].address
      }

      if (updatedSelected === 'balanced' || updatedSelected.startsWith('custom')) {
        updatedFormValues.selected = updatedSelected
        updatedFormValues.amounts = formAmounts.map((a) => ({ ...a, value: '' }))
      }

      updateFormValues({ ...updatedFormValues, lpTokenError })
    },
    [formAmounts, lpToken, lpTokenBalance, selectedToken, selectedTokenAddress, signerAddress, tokens, updateFormValues]
  )

  return (
    <StyledRadioGroup
      aria-label="Customized amounts received"
      isDisabled={isDisabled}
      value={selected === 'custom-amounts' ? 'custom-lpToken' : selected}
      onChange={handleRadioChange}
    >
      <Radio aria-label="Withdraw from one coin" value={'one-coin'}>
        {t`One coin`}
      </Radio>
      <Radio aria-label="Withdraw as balanced amounts" value={'balanced'}>
        {t`Balanced`}
      </Radio>
      {!pool?.isCrypto && (
        <Radio aria-label="Custom withdraw" value={'custom-lpToken'}>
          {t`Custom`}
        </Radio>
      )}
    </StyledRadioGroup>
  )
}

const StyledRadioGroup = styled(RadioGroup)`
  display: grid;
  font-size: var(--font-size-2);
  grid-auto-flow: row;
  justify-content: flex-start;

  ${mediaQueries('sm')(css`
    grid-auto-flow: column;
    column-gap: 0;
  `)}

  svg {
    margin-right: -5px;
  }

  label {
    margin-right: 0.75rem;
  }
`

export default SelectWithdrawOptions
