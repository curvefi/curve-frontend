import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

type UserBoostQuery = ChainQuery<ChainId> & { marketId: string }
type UserBoostParams = FieldsOf<UserBoostQuery>

const _fetchUserSupplyBoost = async ({ marketId }: UserBoostQuery): Promise<{ boost: string | null }> => {
  const api = requireLib('llamaApi')
  if (!api.signerAddress) {
    return {
      boost: null,
    }
  }
  const market = api.getLendMarket(marketId)
  const boost = await market.userBoost(api.signerAddress)

  return {
    boost,
  }
}

export const { useQuery: useUserSupplyBoost, invalidate: invalidateUserSupplyBoost } = queryFactory({
  queryKey: (params: UserBoostParams) =>
    ['userSupplyBoost', { chainId: params.chainId }, { marketId: params.marketId }, 'v1'] as const,
  queryFn: _fetchUserSupplyBoost,
  refetchInterval: '1m',
  validationSuite: createValidationSuite((params: UserBoostParams) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
  }),
})
