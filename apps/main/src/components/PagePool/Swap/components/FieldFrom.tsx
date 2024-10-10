import type { QueryRespUsdRatesMapper } from '@/entities/usd-rates'
import type { SwapFormValues } from '@/entities/swap'

import React, { useCallback, useState } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { t } from '@lingui/macro'

import { NETWORK_TOKEN } from '@/constants'
import { formatNumber } from '@/ui/utils'
import { getMaxAmountMinusGas } from '@/utils/utilsGasPrices'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useSwapContext } from '@/components/PagePool/Swap/contextSwap'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledInputProvider } from '@/components/PagePool/Swap/styles'
import { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import Box from '@/ui/Box'
import FieldHelperUsdRate from '@/components/FieldHelperUsdRate'
import TokenComboBox from '@/components/ComboBoxSelectToken'

type Props = {
  estimatedGas: EstimatedGas
  estimatedGasIsLoading: boolean
  usdRatesMapper: QueryRespUsdRatesMapper | undefined
}

const FieldFrom: React.FC<Props> = ({ estimatedGas, estimatedGasIsLoading, usdRatesMapper }) => {
  const { rChainId, signerAddress, signerPoolBalances, signerPoolBalancesIsLoading, tokens, tokensMapper } =
    usePoolContext()
  const { formValues, isDisabled, updateFormValues } = useSwapContext()
  const basePlusPriority = useStore((state) => state.gas.gasInfo?.basePlusPriority?.[0])

  const [isMaxLoading, setIsLoadingMax] = useState(false)

  const { imageBaseUrl } = networks[rChainId]
  const { isFrom, fromAddress, fromAmount, fromError, toAddress } = formValues

  const fromBalance = signerPoolBalances?.[fromAddress] ?? ''
  const usdRate = usdRatesMapper?.[fromAddress]

  const handleInpChange = useCallback(
    (fromAmount: string) => {
      updateFormValues({ isFrom: true, fromAmount, toAmount: '' })
    },
    [updateFormValues]
  )

  const handleSelectChange = useCallback(
    (value: React.Key) => {
      const val = value as string
      const updatedFormValues: Partial<SwapFormValues> = {}

      if (isAddressEqual(val as Address, toAddress as Address)) {
        updatedFormValues.toAddress = fromAddress
        updatedFormValues.toToken = tokensMapper[fromAddress]?.symbol ?? ''
      }

      updatedFormValues.fromAddress = val
      updatedFormValues.fromToken = tokensMapper[val]?.symbol ?? ''

      if (isFrom || isFrom === null) {
        updatedFormValues.toAmount = ''
      } else {
        updatedFormValues.fromAmount = ''
      }

      updateFormValues(updatedFormValues)
    },
    [fromAddress, isFrom, updateFormValues, tokensMapper, toAddress]
  )

  const handleMaxClick = useCallback(async () => {
    let fromAmount = fromBalance

    if (isAddressEqual(fromAddress as Address, NETWORK_TOKEN) && typeof basePlusPriority !== 'undefined') {
      setIsLoadingMax(estimatedGasIsLoading)
      fromAmount = getMaxAmountMinusGas(estimatedGas, basePlusPriority, fromAmount)
      setIsLoadingMax(false)
    }

    updateFormValues({ isFrom: true, fromAmount, toAmount: '' })
  }, [basePlusPriority, estimatedGas, estimatedGasIsLoading, fromAddress, updateFormValues, fromBalance])

  return (
    <div>
      <Box grid gridGap={1}>
        <StyledInputProvider
          id="fromAmount"
          grid
          gridTemplateColumns="1fr auto 38%"
          inputVariant={fromError ? 'error' : undefined}
          disabled={isDisabled}
        >
          <InputDebounced
            id="inpFromAmount"
            type="number"
            labelProps={
              !!signerAddress && {
                label: t`Avail.`,
                descriptionLoading: signerPoolBalancesIsLoading,
                description: formatNumber(fromBalance, { defaultValue: '-' }),
              }
            }
            value={fromAmount}
            onChange={handleInpChange}
          />
          <InputMaxBtn
            disabled={isDisabled || isMaxLoading}
            loading={isMaxLoading}
            isNetworkToken={fromAddress.toLowerCase() === NETWORK_TOKEN}
            onClick={handleMaxClick}
          />
          <TokenComboBox
            title={t`Select a Token`}
            disabled={isDisabled || tokens.length === 0}
            imageBaseUrl={imageBaseUrl}
            listBoxHeight="400px"
            selectedToken={tokensMapper[fromAddress]}
            showSearch={false}
            tokens={tokens}
            onSelectionChange={handleSelectChange}
          />
        </StyledInputProvider>
        <FieldHelperUsdRate amount={fromAmount} usdRate={usdRate} />
      </Box>
    </div>
  )
}

export default FieldFrom
