import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { getMarkets, Market } from '@curvefi/prices-api/llamalend'
import { getSupportedLendingChainOptions } from '@/loan/entities/chains'
import { Chain } from '@curvefi/prices-api'

export type LendingVault = Market & { chain: Chain }

export const queryLendingVaults = async (): Promise<LendingVault[]> => {
  const chains = await queryClient.fetchQuery(getSupportedLendingChainOptions({}))
  const markets = await Promise.all(
    chains.map(async (chain) => (await getMarkets(chain, {})).map((market) => ({ ...market, chain }))),
  )
  return markets.flat()
}

export const {
  getQueryOptions: getLendingVaultOptions,
  queryKey: getLendingVaultQueryKey,
  invalidate: invalidateLendingVaults,
} = queryFactory({
  queryKey: () => ['lending-vaults', 'v1'] as const,
  queryFn: queryLendingVaults,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
