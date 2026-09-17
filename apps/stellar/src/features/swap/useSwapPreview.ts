import { useGasEstimation } from '@/stellar/lib/gas'
import type { PoolQuery, UserParams } from '@/stellar/queries/root-keys'
import { useSwapQuote } from '@/stellar/queries/swap/swap-quote.query'
import { useSwapSimulation } from '@/stellar/queries/swap/swap-simulation.query'
import type { SwapFormValues } from '@/stellar/queries/validation/swap.validation'
import { maybe } from '@primitives/objects.utils'
import { SWAP_FIELDS } from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, mapQuery, q } from '@ui/features/queries/util'
import { decimalDiv } from '@ui/lib/decimal'
import { useSwapPriceImpact } from './useSwapPriceImpact'

export type SwapPreviewParams = PoolQuery & UserParams & Omit<SwapFormValues, 'minimum'>

function useQuoteQueries(params: SwapPreviewParams) {
  const quote = useSwapQuote(params)
  const { amountField, calculatedField } = SWAP_FIELDS[params.editedSide]
  const amounts = { [amountField]: constQ(params[amountField]), [calculatedField]: q(quote) }
  const { inputAmount, outputAmount } = amounts
  return { inputAmount, outputAmount }
}

export function useSwapPreview(params: SwapPreviewParams) {
  const { decimals, slippage, toIndex } = params
  const { inputAmount, outputAmount } = useQuoteQueries(params)
  const minimum = mapQuery(outputAmount, output =>
    maybe(decimals?.[toIndex], precision => calculateMinimumReceived(output, slippage, precision)),
  )
  const priceImpact = useSwapPriceImpact({ ...params, inputAmount: inputAmount.data }, outputAmount)
  const exchangeRate = combineQueries([inputAmount, outputAmount], (input, output) => decimalDiv(output, input))
  const simulation = useSwapSimulation({ ...params, inputAmount: inputAmount.data, minimum: minimum.data })
  return { inputAmount, outputAmount, minimum, priceImpact, gas: useGasEstimation(params, simulation), exchangeRate }
}
