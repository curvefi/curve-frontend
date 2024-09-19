import React, { useCallback, useState } from 'react'

import { NETWORK_TOKEN } from '@/constants'
import { formatNumber } from '@/ui/utils'
import { getMaxAmountMinusGas } from '@/utils/utilsGasPrices'
import { useDepositContext } from '@/components/PagePool/Deposit/contextDeposit'
import { usePoolContext } from '@/components/PagePool/contextPool'
import useStore from '@/store/useStore'

import FieldToken from '@/components/PagePool/components/FieldToken'

type Props = {
  idx: number
  error: string
  estimatedGas: EstimatedGas | null
  tokenObj: Token
  value: string
}

const FieldAmount: React.FC<Props> = ({ idx, estimatedGas, error, tokenObj, value }) => {
  const { imageBaseUrl, signerAddress, signerPoolBalances, signerPoolBalancesIsLoading, isSeed } = usePoolContext()
  const { isDisabled: formIsDisabled, updateFormValues } = useDepositContext()

  const basePlusPriority = useStore((state) => state.gas.gasInfo?.basePlusPriority[0])

  const [isLoadingMax, setIsLoadingMax] = useState(false)

  const { symbol = '', address = '', ethAddress, haveSameTokenName } = tokenObj ?? {}

  const signerBalance = signerPoolBalances?.[address]
  const isDisabled = formIsDisabled || (!!isSeed && idx !== 0)

  const handleMaxClick = useCallback(() => {
    const isChainToken = address.toLowerCase() === NETWORK_TOKEN
    let value = ''

    // if chain token, subtract some amount for gas
    if (signerBalance && isChainToken) {
      setIsLoadingMax(true)

      if (typeof basePlusPriority !== 'undefined') {
        value = getMaxAmountMinusGas(estimatedGas, basePlusPriority, signerBalance)
      }
      setIsLoadingMax(false)
    }

    if (signerBalance && !isChainToken) {
      value = signerBalance
    }

    updateFormValues({ amount: { idx, value }, isBalancedAmounts: false })
  }, [basePlusPriority, estimatedGas, idx, signerBalance, address, updateFormValues])

  return (
    <FieldToken
      key={`${address}-${idx}`}
      idx={idx}
      amount={value}
      balance={formatNumber(signerBalance ?? '0')}
      balanceLoading={signerPoolBalancesIsLoading}
      disableInput={isDisabled}
      disableMaxButton={isDisabled || !signerAddress}
      hasError={!!error}
      haveSameTokenName={haveSameTokenName}
      haveSigner={!!signerAddress}
      imageBaseUrl={imageBaseUrl}
      isMaxLoading={isLoadingMax}
      token={symbol}
      tokenAddress={ethAddress || address}
      handleAmountChange={(value: string, idx: number) => {
        updateFormValues({ amount: { value, idx }, isBalancedAmounts: false })
      }}
      handleMaxClick={handleMaxClick}
    />
  )
}

export default FieldAmount
