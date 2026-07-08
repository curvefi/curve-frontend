import type { UserPoolParams } from '@ui-kit/lib/model'
import { invalidateUserPoolBalancesQuery } from './user-pool-balances.query'
import { invalidateUserPoolBoostQuery } from './user-pool-boost.query'
import { invalidateUserPoolLiquidityUsdQuery } from './user-pool-liquidity-usd.query'
import { invalidateUserPoolRewardCrvApyQuery } from './user-pool-reward-crv-apy.query'
import { invalidateUserPoolShareQuery } from './user-pool-share.query'

/**
 * Compatibility helper that invalidates all user-pool-info method queries.
 */
export async function invalidateUserPoolInfo(params: UserPoolParams) {
  await Promise.all([
    invalidateUserPoolBalancesQuery(params),
    invalidateUserPoolLiquidityUsdQuery(params),
    invalidateUserPoolShareQuery(params),
    invalidateUserPoolRewardCrvApyQuery(params),
    invalidateUserPoolBoostQuery(params),
  ])
}
