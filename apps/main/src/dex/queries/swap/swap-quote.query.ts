import { swapQuoteValidationSuite } from '@/dex/features/swap/swap.validation'
import type { SwapQuoteParams, SwapQuoteQuery } from '@/dex/features/swap/types'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'

export const { useQuery: useSwapQuote, invalidate: invalidateSwapQuote } = hydratedQueryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    isWrapped,
    fromIndex,
    toIndex,
    decimals,
    editedSide,
    inputAmount,
    outputAmount,
    maxOutput,
  }: SwapQuoteParams) =>
    ({
      name: 'swapQuote',
      chainId,
      poolAddress,
      isWrapped,
      fromIndex,
      toIndex,
      decimals,
      editedSide,
      inputAmount: editedSide === 'pay' ? inputAmount : undefined,
      outputAmount: editedSide === 'receive' ? outputAmount : undefined,
      maxOutput: editedSide === 'receive' ? maxOutput : undefined,
    }) as const,
  queryFn: async ({
    poolAddress,
    isWrapped,
    fromIndex,
    toIndex,
    editedSide,
    inputAmount,
    outputAmount,
  }: SwapQuoteQuery) =>
    (await getPool(poolAddress)[`swap${wrappedMethod(isWrapped)}${editedSide === 'pay' ? 'Expected' : 'Required'}`](
      fromIndex,
      toIndex,
      (editedSide === 'pay' ? inputAmount : outputAmount)!,
    )) as Decimal,
  category: 'dex.swap',
  validationSuite: swapQuoteValidationSuite,
})
