import { useSwapQuote } from '@/dex/queries/swap/swap-quote.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, type QueryProp } from '@ui/features/queries/util'
import { decimalDiv } from '@ui/lib/decimal'
import type { SwapQuoteParams } from '../types'

export const useQuoteQueries = (params: SwapQuoteParams, maxOutput: QueryProp<Decimal>) => {
  const isReceive = params.editedSide === 'receive'
  const inverse = useSwapQuote(params, isReceive)
  const inputAmount = isReceive ? combineQueries([inverse, maxOutput], input => input) : constQ(params.inputAmount)
  // Verify the inverse result using the output this input will actually buy.
  const forward = useSwapQuote({ ...params, editedSide: 'pay', inputAmount: inputAmount.data })
  const expectedOutput = combineQueries([forward, inputAmount], out => out)
  return {
    inputAmount,
    expectedOutput,
    exchangeRate: combineQueries([expectedOutput, inputAmount], (output, input) =>
      maybe(input, input => decimalDiv(output, input)),
    ),
  }
}
