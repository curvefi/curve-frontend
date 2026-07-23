import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { combineQueries, combineQueryState } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { decimalGreaterThan, decimalMax, decimalMinus, decimalPercent, ZERO } from '@ui-kit/utils'
import { validateIsFull } from '../validation/borrow-fields.validation'
import { useUserDiscounts } from './user-discounts.query'

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

/** Returns full health by default, but show band-valued health when it is negative. */
export const useLegacyUserHealthValue = (params: UserMarketParams) =>
  combineQueries(
    [useUserHealth({ ...params, isFull: true }), useUserHealth({ ...params, isFull: false })],
    (full, notFull) => (+notFull < 0 ? notFull : full),
  )

export const useUserHealthValues = (params: UserMarketParams) => {
  const healthFull = useUserHealth({ ...params, isFull: true })
  const healthNotFull = useUserHealth({ ...params, isFull: false })
  const discounts = useUserDiscounts(params)

  return {
    data: maybes(
      [healthFull.data, healthNotFull.data, discounts.data],
      (full, notFull, { loanDiscount, liquidationDiscount }) => {
        const discountGap = decimalMinus(loanDiscount, liquidationDiscount)
        const healthDelta = decimalMinus(full, notFull)
        return {
          /** Distance from entering liquidation protection: the above-band cushion, clamped at zero. */
          health: decimalMax(healthDelta, ZERO) ?? ZERO,
          /** Distance from liquidation as a percentage of the liquidation-discount gap. */
          liquidationBuffer: decimalGreaterThan(discountGap, ZERO) ? decimalPercent(notFull, discountGap) : undefined,
          /** Inputs and intermediate values exposed for developer diagnostics. */
          debug: {
            healthFull: full,
            healthNotFull: notFull,
            healthDelta,
            loanDiscount,
            liquidationDiscount,
            discountGap,
          },
        }
      },
    ),
    ...combineQueryState(healthFull, healthNotFull, discounts),
  }
}
