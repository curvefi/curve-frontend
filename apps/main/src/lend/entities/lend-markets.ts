import { useMemo } from 'react'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { fromEntries } from '@curvefi/prices-api/objects.util'
import { requireLib, useConnection } from '@ui-kit/features/connect-wallet'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import type { Address } from '@ui-kit/utils'

/**
 * Query to get a mapping of lending market controller address to market name for all lending markets on a specific chain.
 * Primarily useful fetching lending markets via URL.
 */
export const { useQuery: useLendMarketMapping } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'lend-markets'] as const,
  queryFn: async ({ chainId }: ChainQuery<ChainId>) => {
    const api = requireLib('llamaApi')
    return fromEntries(
      api.lendMarkets
        .getMarketList()
        .filter((marketName) => !networks[chainId].hideMarketsInUI[marketName])
        .map((name) => [api.getLendMarket(name).addresses.controller as Address, name]),
    )
  },
  staleTime: '1h',
  refetchInterval: '1h',
  validationSuite: llamaApiValidationSuite({ beHydrated: true }),
})

/**
 * Hook to get a specific lending market by its id or controller address.
 * @param chainId The chain for which to get the lending market of
 * @param marketId Lend market id or controller address
 * @returns The market instance, if found.
 */
export const useLendMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) => {
  const { data: marketMapping } = useLendMarketMapping({ chainId })
  const { llamaApi: api } = useConnection()

  /** Create mappings from market name or controller id to market instance. */
  return (
    useMemo(
      () =>
        api?.getLendMarket(marketId) || // Try to get the market by name first, before attempting to get by mapping
        (marketMapping &&
          marketId in marketMapping &&
          api?.hydrated &&
          api.chainId === chainId &&
          api.getLendMarket(marketMapping[marketId as Address])),
      [api, chainId, marketId, marketMapping],
    ) || undefined
  )
}
