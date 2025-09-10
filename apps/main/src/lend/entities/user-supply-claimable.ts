import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

type UserSupplyClaimableQuery = ChainQuery<ChainId> & { marketId: string }
type UserSupplyClaimableParams = FieldsOf<UserSupplyClaimableQuery>

const _fetchUserSupplyClaimable = async ({
  marketId,
}: UserSupplyClaimableQuery): Promise<{
  crv: string
  rewards: { token: string; symbol: string; amount: string }[]
}> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const [crv, rewards] = await Promise.all([market.vault.claimableCrv(), market.vault.claimableRewards()])

  return { crv, rewards }
}

export const { useQuery: useUserSupplyClaimable, invalidate: invalidateUserSupplyClaimable } = queryFactory({
  queryKey: (params: UserSupplyClaimableParams) =>
    ['userSupplyClaimable', { chainId: params.chainId }, { marketId: params.marketId }, 'v1'] as const,
  queryFn: _fetchUserSupplyClaimable,
  refetchInterval: '1m',
  validationSuite: createValidationSuite((params: UserSupplyClaimableParams) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
  }),
})
