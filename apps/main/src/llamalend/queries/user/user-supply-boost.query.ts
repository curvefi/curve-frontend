import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'

const _fetchUserSupplyBoost = async ({ marketId }: MarketQuery): Promise<number | null> => {
  const api = requireLib('llamaApi')
  if (!api.signerAddress) {
    return null
  }
  const market = api.getLendMarket(marketId)
  const boost = await market.userBoost(api.signerAddress)

  return boost ? +boost : null
}

export const { useQuery: useUserSupplyBoost } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'userSupplyBoost', 'v1'] as const,
  queryFn: _fetchUserSupplyBoost,
  category: 'llamalend.user',
  validationSuite: marketIdValidationSuite,
})
