import { getWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-config'
import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { fetchUniswapPositions } from '../api/uniswap.api'

export const { useQuery: useUniswapPositions, invalidate: invalidateUniswapPositions } = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    ({ name: 'uniswapPositions', chainId, userAddress }) as const,
  queryFn: ({ chainId, userAddress }: UserChainQuery) =>
    fetchUniswapPositions(assert(getWagmiConfig(), 'Wagmi config is not initialized'), chainId, userAddress),
  category: 'dex.user',
  validationSuite: createValidationSuite((params: UserChainParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
})
