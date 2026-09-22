import type { PoolQuery } from '@/stellar/queries/root-keys'
import { useSwapQuote } from '@/stellar/queries/swap/swap-quote.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { getSmallSwapAmount } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalDiv } from '@ui/lib/decimal'
import { calculatePriceImpact } from '@ui/lib/price-impact.util'

/** Compare the trade's rate with a small swap, as in the main DEX pool form. */
export function useSwapPriceImpact(
  params: PoolQuery & Pick<SwapFormValues, 'inputAmount' | 'decimals' | 'fromIndex' | 'toIndex'>,
  quote: QueryProp<Decimal | undefined>,
) {
  const { inputAmount, decimals, fromIndex, toIndex } = params
  const smallAmount = mapQuery(quote, output =>
    maybes([inputAmount, decimals?.[fromIndex], decimals?.[toIndex]], (input, inputDecimals, outputDecimals) =>
      getSmallSwapAmount(input, output, inputDecimals, outputDecimals),
    ),
  )
  const smallQuote = useSwapQuote({ ...params, inputAmount: smallAmount.data, editedSide: 'pay' })
  return combineQueries([quote, smallQuote, smallAmount], (output, smallOutput, smallInput) =>
    maybe(
      inputAmount,
      input => calculatePriceImpact(decimalDiv(output, input), decimalDiv(smallOutput, smallInput)) ?? null,
    ),
  )
}
