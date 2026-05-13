import { useMemo } from 'react'
import { USE_API } from '@/llamalend/queries/market/market.constants'
import { ChainId } from '@/loan/types/loan.types'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Address } from '@primitives/address.utils'
import { requireLib, useCurve } from '@ui-kit/features/connect-wallet'
import { ChainParams, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

const { useQuery: useMintMarkets, prefetchQuery: prefetchMintMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'mintMarkets.getMarketList'] as const,
  queryFn: async (): Promise<string[]> => {
    const api = requireLib('llamaApi')
    await api.mintMarkets.fetchMintMarkets({ useApi: USE_API })
    return api.mintMarkets.getMarketList()
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})

const useMintMarketMapping = ({ chainId }: ChainParams<ChainId>) => {
  const { data: marketNames, isSuccess, error } = useMintMarkets({ chainId })
  const { llamaApi: api, isHydrated } = useCurve()
  const apiChainId = api?.chainId
  const data: Record<string, MintMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      marketNames && api && chainId == apiChainId && isHydrated
        ? Object.fromEntries(
            marketNames
              .map(name => [name, api.getMintMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.controller, market],
              ]),
          )
        : undefined,
    [api, apiChainId, chainId, isHydrated, marketNames],
  )
  return { data, isSuccess, error }
}

export const useMintMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string | Address }) => {
  const { data: markets, isSuccess, ...rest } = useMintMarketMapping({ chainId })
  return { data: markets?.[marketId], isSuccess: isSuccess && !!markets, ...rest }
}

export { prefetchMintMarkets }
