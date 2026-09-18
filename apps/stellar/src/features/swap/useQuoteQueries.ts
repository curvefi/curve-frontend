import { useSwapQuote } from '@/stellar/queries/swap/swap-quote.query'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, q } from '@ui/features/queries/util'
import type { SwapFormQuery } from './types'

export function useQuoteQueries(params: SwapFormQuery) {
  const isReceive = params.editedSide === 'receive'
  const inverseQuote = useSwapQuote(params, isReceive)
  const inputAmount = isReceive ? q(inverseQuote) : constQ(params.inputAmount)
  // get_dx is approximate: use get_dy for the output this input will actually buy.
  const forwardQuote = useSwapQuote({ ...params, inputAmount: inputAmount.data, editedSide: 'pay' })
  const outputAmount = combineQueries([inputAmount, forwardQuote], (_, output) => output)
  return { inputAmount, outputAmount }
}
