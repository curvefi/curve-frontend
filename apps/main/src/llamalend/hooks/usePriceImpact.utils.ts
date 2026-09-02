import { decimalDiv, decimalMax, decimalMinus, decimalMultiply, fromWei } from '@evm-ui/utils/decimal'
import type { Decimal } from '@primitives/decimal.utils'

/**
 * Calculates price impact by comparing the selected quote's exchange rate with the exchange rate of a tiny reference
 * quote from the same provider. The reference quote approximates the marginal price before the full trade affects it.
 *
 * A negative result means the selected quote has a better rate than the reference quote and is therefore clamped to 0.
 */
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
