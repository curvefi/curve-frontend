import type { Address } from 'viem'
import type { ChainParams, ChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationSuite } from '@evm-ui/queries/validation/chain-validation'
import { addQueryString, fetchJson } from '@primitives/fetch.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePoolAddresses, queryKey: getPoolAddressesQueryKey } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'poolAddresses', chainId }) as const,
  queryFn: ({ chainId }: ChainQuery) =>
    fetchJson<Address[]>(`/api/router/v1/pools/addresses${addQueryString({ chainId })}`),
  validationSuite: chainValidationSuite,
  category: 'dex.pools',
})
