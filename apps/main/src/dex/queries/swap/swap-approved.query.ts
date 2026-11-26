import { userSwapParamsValidationSuite } from '@/dex/features/swap/swap.validation'
import type { SwapQuery, UserSwapParams } from '@/dex/features/swap/types'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'

export const { useQuery: useSwapIsApproved, fetchQuery: fetchSwapIsApproved } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress, isWrapped, fromIndex, inputAmount }: UserSwapParams) =>
    ({ name: 'swapIsApproved', chainId, poolAddress, userAddress, isWrapped, fromIndex, inputAmount }) as const,
  queryFn: async ({ poolAddress, isWrapped, fromIndex, inputAmount }: SwapQuery) =>
    await getPool(poolAddress)[`swap${wrappedMethod(isWrapped)}IsApproved`](fromIndex, inputAmount),
  category: 'dex.swap',
  validationSuite: userSwapParamsValidationSuite,
})
