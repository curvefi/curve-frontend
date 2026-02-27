import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'
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
export const {
  useQuery: useUserHealth,
  getQueryOptions: getUserHealthOptions,
  invalidate: invalidateUserHealth,
} = queryFactory({
  queryKey: ({ isFull, ...params }: UserHealthParams) =>
    [...rootKeys.userMarket(params), 'market-user-health', { isFull }] as const,
  queryFn: async ({ marketId, userAddress, isFull }: UserHealthQuery) =>
    (await getLlamaMarket(marketId).userHealth(isFull, userAddress)) as Decimal,
  refetchInterval: '1m',
  validationSuite: createValidationSuite(({ userAddress, isFull, marketId, chainId }: UserHealthParams) => {
    userMarketValidationSuite({ userAddress, marketId, chainId })
    validateIsFull(isFull)
  }),
})
