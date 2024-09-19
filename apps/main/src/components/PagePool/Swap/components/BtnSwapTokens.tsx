import React, { useCallback } from 'react'

import { useSwapContext } from '@/components/PagePool/Swap/contextSwap'

import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'

const BtnSwapTokens: React.FC = () => {
  const { formValues, isDisabled, updateFormValues } = useSwapContext()

  const { isFrom, fromToken, fromAddress, fromAmount, toToken, toAddress, toAmount } = formValues

  const handleSwap = useCallback(() => {
    const updatedIsFrom = !isFrom

    updateFormValues({
      isFrom: updatedIsFrom,
      fromToken: toToken,
      fromAddress: toAddress,
      fromAmount: updatedIsFrom ? toAmount : '',
      toToken: fromToken,
      toAddress: fromAddress,
      toAmount: updatedIsFrom ? '' : fromAmount,
    })
  }, [isFrom, updateFormValues, toToken, toAddress, toAmount, fromToken, fromAddress, fromAmount])

  return (
    <Box flex flexJustifyContent="center">
      <IconButton disabled={isDisabled} onClick={handleSwap} size="medium">
        <Icon name="ArrowsVertical" size={24} aria-label="icon arrow vertical" />
      </IconButton>
    </Box>
  )
}

export default BtnSwapTokens
