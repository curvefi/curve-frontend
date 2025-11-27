import { enforce, group, test } from 'vest'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { type MarketQuery, queryFactory, rootKeys, type UserQuery } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { decimal } from '@ui-kit/utils'

/**
 * Query for fetching user PNL data in lend and mint markets.
 * PNL data from llamalend-js for mint markets is currently only available when v2 leverage is enabled.
 */
type UserPnlQuery = UserQuery & MarketQuery<IChainId> & { loanExists: boolean; hasV2Leverage: boolean }
type UserPnlParams = FieldsOf<UserPnlQuery>

export const { useQuery: useUserPnl, invalidate: invalidateUserPnl } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserPnlParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'user-pnl'] as const,
  queryFn: async ({ marketId, userAddress }: UserPnlQuery) => {
    const market = getLlamaMarket(marketId)

    const pnl = await market.currentPnL(userAddress)
    return {
      currentPosition: decimal(pnl?.currentPosition),
      deposited: decimal(pnl?.deposited),
      currentProfit: decimal(pnl?.currentProfit),
      percentage: decimal(pnl?.percentage),
    }
  },
  staleTime: '1m',
  validationSuite: createValidationSuite((params: UserPnlParams) => {
    marketIdValidationSuite(params)
    loanExistsValidationGroup(params)
    group('hasV2LeverageValidation', () => {
      test('hasV2Leverage', () => {
        enforce(params.hasV2Leverage).isBoolean().equals(true)
      })
    })
  }),
})
