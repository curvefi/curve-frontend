import type { ChainParams, ChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { fetchUniswapV3Pools } from '../api/uniswap-pools.api'

export const { useQuery: useUniswapV3Pools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'uniswapV3Pools', chainId }) as const,
  queryFn: ({ chainId }: ChainQuery) => fetchUniswapV3Pools(chainId),
  category: 'dex.pools',
  validationSuite: createValidationSuite(chainValidationGroup),
})
