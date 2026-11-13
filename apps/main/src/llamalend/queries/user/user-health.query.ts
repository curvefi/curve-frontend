import { getPositionHealth, type PositionHealthThresholds } from '@/llamalend/health.utils'
import { pickDisplayLegacyHealth } from '@/llamalend/llama.utils'
import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { useMarketOraclePrice } from '../market/market-oracle-price.query'
import { validateIsFull } from '../validation/borrow-fields.validation'
import { useUserDiscounts } from './user-discounts.query'
import { useUserPrices } from './user-prices.query'
import { useUserState } from './user-state.query'

type UserHealthParams = UserMarketParams & { isFull: boolean }
type UserHealthQuery = UserMarketQuery & { isFull: boolean }

/**
 * Query to get the user's health in a market.
 * Note this is NOT the health change when repaying debt, use `repayHealth` query for that.
 */
export const {
  useQuery: useUserHealth,
  getQueryOptions: getUserHealthOptions,
  queryKey: getUserHealthKey,
} = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, isFull }: UserHealthParams) =>
    ({ name: 'userHealth', chainId, marketId, userAddress, isFull }) as const,
  queryFn: async ({ marketId, userAddress, isFull }: UserHealthQuery) =>
    (await getUserPositionImplementation(marketId).userHealth(isFull, userAddress)) as Decimal,
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ userAddress, isFull, marketId, chainId }: UserHealthParams) => {
    userMarketValidationSuite.run({ userAddress, marketId, chainId })
    validateIsFull(isFull)
  }),
})

/** Returns full health by default, but show band-valued health when it is negative. */
export const useLegacyUserHealthValue = (params: UserMarketParams) =>
  combineQueries(
    [useUserHealth({ ...params, isFull: true }), useUserHealth({ ...params, isFull: false })],
    (full, notFull) => pickDisplayLegacyHealth(full, notFull),
  )

/** The position's health, liquidation buffer and status. No data when the user has no loan. */
export const usePositionHealth = (params: UserMarketParams, thresholds: PositionHealthThresholds) =>
  combineQueries(
    [
      useMarketOraclePrice(params),
      useUserPrices(params),
      useUserHealth({ ...params, isFull: false }),
      useUserHealth({ ...params, isFull: true }),
      useUserState(params),
      useUserDiscounts(params, useNewLlamalendHealth()),
    ],
    (oraclePrice, prices, liquidationBuffer, healthFull, { debt }, { loanDiscount, liquidationDiscount }) =>
      maybe(prices, prices =>
        getPositionHealth({
          oraclePrice,
          prices,
          liquidationBuffer,
          healthFull,
          debt,
          loanDiscount,
          liquidationDiscount,
          thresholds,
        }),
      ),
  )
