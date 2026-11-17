import { swapQueryValidationSuite } from '@/dex/features/swap/swap.validation'
import type { SwapParams, SwapQuery } from '@/dex/features/swap/types'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'

export const { useQuery: useSwapPriceImpact, invalidate: invalidateSwapPriceImpact } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, fromIndex, toIndex, inputAmount }: SwapParams) =>
    ({ name: 'swapPriceImpact', chainId, poolAddress, isWrapped, fromIndex, toIndex, inputAmount }) as const,
  queryFn: async ({ poolAddress, isWrapped, fromIndex, toIndex, inputAmount }: SwapQuery): Promise<Decimal> =>
    `${await getPool(poolAddress)[`swap${wrappedMethod(isWrapped)}PriceImpact`](fromIndex, toIndex, inputAmount)}`,
  category: 'dex.swap',
  validationSuite: swapQueryValidationSuite,
})
