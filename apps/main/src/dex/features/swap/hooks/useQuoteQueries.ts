import { useSwapQuote } from '@/dex/queries/swap/swap-quote.query'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, q } from '@ui/features/queries/util'
import type { SwapQuoteParams } from '../types'

export const useQuoteQueries = (params: SwapQuoteParams) => {
  const isReceive = params.editedSide === 'receive'
  const inverse = useSwapQuote(params, isReceive)
  const inputAmount = isReceive ? q(inverse) : constQ(params.inputAmount ?? undefined)
  // Verify the inverse result using the output this input will actually buy.
  const forward = useSwapQuote({ ...params, editedSide: 'pay', inputAmount: inputAmount.data })
  return { inputAmount, expectedOutput: combineQueries([inputAmount, forward], (_, output) => output) }
}
