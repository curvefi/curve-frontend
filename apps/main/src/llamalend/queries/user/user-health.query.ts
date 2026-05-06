import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { validateIsFull } from '../validation/borrow-fields.validation'

type UserHealthParams = UserMarketParams & { isFull: boolean }
type UserHealthQuery = UserMarketQuery & { isFull: boolean }

/**
 * Query to get the user's health in a market.
 * Note this is NOT the health change when repaying debt, use `repayHealth` query for that.
 */
export const { useQuery: useUserHealth, getQueryOptions: getUserHealthOptions } = queryFactory({
  queryKey: ({ isFull, ...params }: UserHealthParams) =>
    [...rootKeys.userMarket(params), 'userHealth', { isFull }] as const,
  queryFn: async ({ marketId, userAddress, isFull }: UserHealthQuery) =>
    (await getUserPositionImplementation(marketId).userHealth(isFull, userAddress)) as Decimal,
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ userAddress, isFull, marketId, chainId }: UserHealthParams) => {
    userMarketValidationSuite({ userAddress, marketId, chainId })
    validateIsFull(isFull)
  }),
})

export const useUserHealthValue = (params: UserMarketParams) => {
  const healthFull = useUserHealth({ ...params, isFull: true })
  const healthNotFull = useUserHealth({ ...params, isFull: false })
  return {
    data: healthFull.data && healthNotFull.data && (+healthNotFull.data < 0 ? healthNotFull.data : healthFull.data),
    ...combineQueryState(healthFull, healthNotFull),
  }
}
