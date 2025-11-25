import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { Decimal } from '@ui-kit/utils'
import { validateIsFull } from './validation/borrow-fields.validation'

type UserHealthParams = UserMarketParams & { isFull: boolean }
type UserHealthQuery = UserMarketQuery & { isFull: boolean }

const userHealthValidationSuite = createValidationSuite(
  ({ userAddress, isFull, marketId, chainId }: UserHealthParams) => {
    userMarketValidationSuite({ userAddress, marketId, chainId })
    validateIsFull(isFull)
  },
)

// TODO: This query is for the current user health, not the change in health when repaying debt.
// Use `market.repayHealth` for that.

export const { getQueryOptions: getUserHealthOptions, invalidate: invalidateUserHealth } = queryFactory({
  queryKey: ({ isFull, ...params }: UserHealthParams) =>
    [...rootKeys.userMarket(params), 'market-user-health', { isFull }] as const,
  queryFn: async ({ marketId, userAddress, isFull }: UserHealthQuery) =>
    (await getLlamaMarket(marketId).userHealth(isFull, userAddress)) as Decimal,
  validationSuite: userHealthValidationSuite,
})
