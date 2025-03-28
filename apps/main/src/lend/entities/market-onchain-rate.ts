import { lendingJsValidationSuite } from '@/lend/entities/validation/lending-js-validation'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'

type Params = ChainParams<ChainId> & {
  marketId: string
}

const _fetchOnChainMarketRate = async ({ chainId, marketId }: ChainQuery<ChainId> & { marketId: string }) => {
  const api = useStore.getState().api
  const market = api?.getOneWayMarket(marketId)

  if (!market) return null
  const ratesRes = await market.stats.rates(false, false)

  return { rates: ratesRes }
}

/**
 * The purpose of this query is to allow fetching market parameters on chain
 * in order to display the most current data when a wallet is connected.
 * The api data can have a few minutes delay.
 * */
export const { useQuery: useMarketOnChainRates, invalidate: invalidateMarketOnChainRates } = queryFactory({
  queryKey: (params: Params) =>
    ['marketOnchainData', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _fetchOnChainMarketRate,
  refetchInterval: '1m',
  validationSuite: lendingJsValidationSuite,
})
