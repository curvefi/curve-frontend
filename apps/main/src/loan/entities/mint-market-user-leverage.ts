import { ChainId } from '@/loan/types/loan.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type UserLeverageQuery = ChainQuery<ChainId> & { marketId: string; userAddress: string }
type UserLeverageParams = FieldsOf<UserLeverageQuery>

/**
 * Fetches current leverage for a user's position in a mint market
 */
const _getMintMarketUserLeverage = async ({ marketId, userAddress }: UserLeverageQuery): Promise<{ value: string }> => {
  const api = requireLib('llamaApi')
  const market = api.getMintMarket(marketId)
  const currentLeverage = market.leverageV2.hasLeverage() ? await market.leverageV2.currentLeverage(userAddress) : ''
  return { value: currentLeverage }
}

export const { useQuery: useMintMarketUserLeverage } = queryFactory({
  queryKey: (params: UserLeverageParams) =>
    [
      'mintMarketUserLeverage',
      { chainId: params.chainId },
      { marketId: params.marketId },
      { userAddress: params.userAddress },
      'v1',
    ] as const,
  queryFn: _getMintMarketUserLeverage,
  validationSuite: llamaApiValidationSuite,
})
