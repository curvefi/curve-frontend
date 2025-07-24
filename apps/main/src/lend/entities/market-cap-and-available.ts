import { USE_API } from '@/lend/shared/config'
import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

type MarketCapAndAvailable = {
  cap: number
  available: number
}

/**
 * The purpose of this query is to allow fetching market collateral amounts on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCapAndAvailable = async ({ marketId }: MarketQuery): Promise<MarketCapAndAvailable> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const capAndAvailable = await market.stats.capAndAvailable(false, USE_API)
  return {
    cap: +capAndAvailable.cap,
    available: +capAndAvailable.available,
  }
}

export const { useQuery: useMarketCapAndAvailable } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketCapAndAvailable', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketCapAndAvailable,
  refetchInterval: '5m',
  validationSuite: llamaApiValidationSuite,
})
