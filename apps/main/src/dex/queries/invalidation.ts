import type { UserPoolParams } from '@evm-ui/lib/model'
import { invalidateUserPoolBalancesQuery } from './user-pool-balances.query'
import { invalidateUserPoolBoostQuery } from './user-pool-boost.query'
import { invalidateUserPoolLiquidityUsdQuery } from './user-pool-liquidity-usd.query'
import { invalideUserPoolPositions } from './user-pool-positions.query'
import { invalidateUserPoolRewardCrvApyQuery } from './user-pool-reward-crv-apy.query'
import { invalidateUserPoolShareQuery } from './user-pool-share.query'

/**
 * Compatibility helper that refreshes user-pool-info method queries and the user's pool positions.
 */
export const invalidateUserPoolInfo = async (params: UserPoolParams) => {
  await Promise.all([
    invalidateUserPoolBalancesQuery(params),
    invalidateUserPoolLiquidityUsdQuery(params),
    invalidateUserPoolShareQuery(params),
    invalidateUserPoolRewardCrvApyQuery(params),
    invalidateUserPoolBoostQuery(params),
    invalideUserPoolPositions(params),
  ])
}
