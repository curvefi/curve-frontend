import { decimalDiv, decimalMax, decimalMinus, decimalMultiply, fromWei } from '@evm-ui/utils/decimal'
import type { Decimal } from '@primitives/decimal.utils'

export const calculatePriceImpact = ({
  selectedAmountIn,
  selectedAmountOut,
  referenceAmountIn,
  referenceAmountOut,
  tokenInDecimals,
  tokenOutDecimals,
}: {
  selectedAmountIn: Decimal
  selectedAmountOut: Decimal
  referenceAmountIn: Decimal
  referenceAmountOut: Decimal
  tokenInDecimals: number
  tokenOutDecimals: number
}) => {
  const amountIn = fromWei(selectedAmountIn, tokenInDecimals)
  const amountOut = fromWei(selectedAmountOut, tokenOutDecimals)
  const referenceOut = fromWei(referenceAmountOut, tokenOutDecimals)
  const referenceIn = fromWei(referenceAmountIn, tokenInDecimals)
  const selectedRate = decimalDiv(amountOut, amountIn)
  const referenceRate = decimalDiv(referenceOut, referenceIn)
  const ratio = decimalDiv(selectedRate, referenceRate)
  return decimalMax('0', decimalMultiply(decimalMinus('1', ratio), '100'))
}
