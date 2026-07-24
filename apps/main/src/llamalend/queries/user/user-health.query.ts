import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { combineQueries, combineQueryState } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { QueryData } from '@ui-kit/lib/queries/types'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { QueryProp } from '@ui-kit/types/util'
import { decimalDiv, decimalGreaterThan, decimalMinus, decimalPercent, decimalSum, ZERO } from '@ui-kit/utils'
import { validateIsFull } from '../validation/borrow-fields.validation'
import { useUserDiscounts } from './user-discounts.query'

type UserHealthParams = UserMarketParams & { isFull: boolean }
type UserHealthQuery = UserMarketQuery & { isFull: boolean }

/**
 * Full and non-full health may be read from different blocks.
 * Treat tiny subtraction differences as zero when the position is at or below the upper band.
 */
const HEALTH_DUST_THRESHOLD: Decimal = '0.0001'

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
        const health = decimalGreaterThan(healthDelta, HEALTH_DUST_THRESHOLD) ? healthDelta : ZERO
        return {
          /** Percentage distance from entering liquidation protection: the above-band cushion, clamped at zero. */
          health,
          /**
           * Ratio of the above-band cushion plus debt to the debt amount.
           * A health factor of 1 marks the entry into liquidation protection (soft liquidation).
           * The +1 is equivalent to adding debt / debt, similar to how other lending platforms display health.
           */
          healthFactor: decimalSum('1', decimalDiv(health, '100')),
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

export type HealthQuery = QueryProp<QueryData<typeof useUserHealthValues>>
