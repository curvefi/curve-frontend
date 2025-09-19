import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'

const _fetchUserSupplyClaimable = async ({
  marketId,
}: MarketQuery): Promise<{
  crv: string
  rewards: { token: string; symbol: string; amount: string }[]
}> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const [crv, rewards] = await Promise.all([market.vault.claimableCrv(), market.vault.claimableRewards()])

  return { crv, rewards }
}

export const { useQuery: useUserSupplyClaimable, invalidate: invalidateUserSupplyClaimable } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'userSupplyClaimable', 'v1'] as const,
  queryFn: _fetchUserSupplyClaimable,
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
