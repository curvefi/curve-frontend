import type { QueryRespUsdRatesMapper } from '@/entities/usd-rates'

import React, { useCallback } from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useSwapContext } from '@/components/PagePool/Swap/contextSwap'
import networks from '@/networks'

import { StyledInputProvider } from '@/components/PagePool/Swap/styles'
import { InputDebounced } from '@/ui/InputComp'
import FieldHelperUsdRate from '@/components/FieldHelperUsdRate'
import TokenComboBox from '@/components/ComboBoxSelectToken'

type Props = {
  usdRatesMapper: QueryRespUsdRatesMapper | undefined
}

const FieldTo: React.FC<Props> = ({ usdRatesMapper }) => {
  const { rChainId, signerAddress, signerPoolBalances, signerPoolBalancesIsLoading, tokens, tokensMapper } =
    usePoolContext()
  const { formValues, isDisabled, updateFormValues } = useSwapContext()

  const { imageBaseUrl } = networks[rChainId]
  const { isFrom, fromAddress, toAddress, toAmount, toError } = formValues

  const toBalance = signerPoolBalances?.[toAddress] ?? ''
  const toUsdRate = usdRatesMapper?.[toAddress]

  const handleSelectChange = useCallback(
    (value: React.Key) => {
      const val = value as string
      const cFormValues = { ...formValues }

      if (val === fromAddress) {
        cFormValues.fromAddress = toAddress
        cFormValues.fromToken = tokensMapper[toAddress]?.symbol ?? ''
      }

      cFormValues.toAddress = val
      cFormValues.toToken = tokensMapper[val]?.symbol ?? ''

      if (isFrom || isFrom === null) {
        cFormValues.toAmount = ''
      } else {
        cFormValues.fromAmount = ''
      }
      updateFormValues(cFormValues)
    },
    [formValues, fromAddress, isFrom, tokensMapper, toAddress, updateFormValues]
  )

  return (
    <div>
      <StyledInputProvider
        id="toAmount"
        inputVariant={toError ? 'error' : undefined}
        disabled={isDisabled}
        grid
        gridTemplateColumns="1fr 38%"
      >
        <InputDebounced
          id="inpToAmount"
          type="number"
          labelProps={
            !!signerAddress && {
              label: t`Avail.`,
              descriptionLoading: signerPoolBalancesIsLoading,
              description: formatNumber(toBalance, { defaultValue: '-' }),
            }
          }
          value={toAmount}
          onChange={(val) => updateFormValues({ isFrom: false, toAmount: val, fromAmount: '' })}
        />
        <TokenComboBox
          title={t`Select a Token`}
          disabled={isDisabled || tokens.length === 0}
          imageBaseUrl={imageBaseUrl}
          listBoxHeight="400px"
          selectedToken={tokensMapper[toAddress]}
          showSearch={false}
          tokens={tokens}
          onSelectionChange={handleSelectChange}
        />
      </StyledInputProvider>
      <FieldHelperUsdRate amount={toAmount} usdRate={toUsdRate} />
    </div>
  )
}

export default FieldTo
