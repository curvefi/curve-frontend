import { useQueries } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import type { QueryResultsArray } from '@ui-kit/lib/queries/types'
import type { Decimal } from '@ui-kit/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryKey = any // disable typecheck for this as we accept any query key
type HealthQueryOptions = UseQueryOptions<Decimal, Error, Decimal, QueryKey>
type HealthQueryResults = QueryResultsArray<readonly HealthQueryOptions[]>

/**
 * Docs courtesy of Saint Rat:
 *
 * ** healthNotFull **
 *   healthNotFull is like your soft-liquidation buffer, it's unchanging unless you're in soft-liq.
 *   It means you estimate the value of each bit of collateral in each band, and compare against debt
 *
 *   For a simple example with 2 bands each with 1 ETH:
 *    range: $1000-$1200, mid point is $1100, band value is 1 ETH x $1100 = $1100
 *    range: $1200-$1400, mid point is $1300, band value is 1 ETH x $1300 = $1300
 *
 *   Total collateral value is therefore $1100 + $1300, so $2400, if debt is $2000, then health should be 2400/2000 - 100% = 20%
 *
 * ** healthFull **
 *   healthFull means you also add in the value above the bands to healthNotFull (soft-liq buffer),
 *
 *   e.g. if we continue with the above example and the ETH price is currently $2000:
 *    The top band finishes at $1400, so the price is currently $600 above the bands.
 *    We then add $600 x 2 ETH to the collateral value = $1200
 *
 *   Total collateral value is therefore $2400 + $1200 = $3600, so health should be 3600/2000 - 100% = 80%
 *
 * @return
 *   In or below soft-liq healthFull = healthNotFull, above soft-liq healthFull > healthNotFull
 *   When healthNotFull is below 0, the user is in soft-liq and we should return the corresponding metric.
 */
const combineHealth = ([healthFull, healthNotFull]: HealthQueryResults) => ({
  data:
    healthFull.data == null || healthNotFull.data == null
      ? undefined
      : +healthNotFull.data < 0
        ? healthNotFull.data
        : healthFull.data,
  ...combineQueriesMeta([healthFull, healthNotFull]),
})

/**
 * Combines two health queries: one for full health and one for not full health.
 * @param getOptions - Function that returns the query options for a given isFull boolean.
 * @returns Combined health query result.
 */
export const useHealthQueries = (getOptions: (isFull: boolean) => HealthQueryOptions) =>
  useQueries({
    queries: [true, false].map((isFull) => getOptions(isFull)),
    combine: combineHealth,
  })
