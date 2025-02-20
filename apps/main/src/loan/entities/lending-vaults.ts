import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { getMarkets, Market } from '@curvefi/prices-api/llamalend'
import { fetchSupportedLendingChains } from '@ui-kit/entities/chains'
import { Chain } from '@curvefi/prices-api'

export type LendingVault = Market & { chain: Chain }

export const { getQueryOptions: getLendingVaultOptions, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults', 'v1'] as const,
  queryFn: async (): Promise<LendingVault[]> => {
    const chains = await fetchSupportedLendingChains({})
    const markets = await Promise.all(
      chains.map(async (chain) => (await getMarkets(chain, {})).map((market) => ({ ...market, chain }))),
    )
    return markets.flat()
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
