import type { UserPoolParams } from '@ui-kit/lib/model'
import { invalidateUserPoolBalancesQuery, useUserPoolBalancesQuery } from '../queries/user-pool-balances.query'
import { invalidateUserPoolBoostQuery, useUserPoolBoostQuery } from '../queries/user-pool-boost.query'
import {
  invalidateUserPoolLiquidityUsdQuery,
  useUserPoolLiquidityUsdQuery,
} from '../queries/user-pool-liquidity-usd.query'
import {
  invalidateUserPoolRewardCrvApyQuery,
  useUserPoolRewardCrvApyQuery,
} from '../queries/user-pool-reward-crv-apy.query'
import { invalidateUserPoolShareQuery, useUserPoolShareQuery } from '../queries/user-pool-share.query'
import { usePoolTokenDepositBalances } from './usePoolTokenDepositBalances'

const DEFAULT_USER_POOL_INFO = {
  userCrvApy: { crvApy: 0, boostApy: '' },
  userLiquidityUsd: '',
  userShare: null,
  userWithdrawAmounts: [],
}

/** Hook to get user pool info including balances and details */
export const useUserPoolInfo = (params: UserPoolParams) => {
  const { lpTokenBalance, gaugeTokenBalance, isLoading: balancesLoading } = usePoolTokenDepositBalances(params)
  const enabled = +(lpTokenBalance ?? 0) > 0 || +(gaugeTokenBalance ?? 0) > 0
  const {
    data: userWithdrawAmounts,
    isLoading: userBalancesLoading,
    error: userBalancesError,
  } = useUserPoolBalancesQuery(params, enabled)
  const {
    data: userLiquidityUsd,
    isLoading: userLiquidityUsdLoading,
    error: userLiquidityUsdError,
  } = useUserPoolLiquidityUsdQuery(params, enabled)
  const { data: userShare, isLoading: userShareLoading, error: userShareError } = useUserPoolShareQuery(params, enabled)
  const { data: crvApy, isLoading: crvApyLoading, error: crvApyError } = useUserPoolRewardCrvApyQuery(params, enabled)
  const { data: boostApy, isLoading: boostApyLoading, error: boostApyError } = useUserPoolBoostQuery(params, enabled)
  return {
    data: {
      userCrvApy: {
        crvApy: crvApy ?? DEFAULT_USER_POOL_INFO.userCrvApy.crvApy,
        boostApy: boostApy ?? DEFAULT_USER_POOL_INFO.userCrvApy.boostApy,
      },
      userLiquidityUsd: userLiquidityUsd ?? DEFAULT_USER_POOL_INFO.userLiquidityUsd,
      userShare: userShare ?? DEFAULT_USER_POOL_INFO.userShare,
      userWithdrawAmounts: userWithdrawAmounts ?? DEFAULT_USER_POOL_INFO.userWithdrawAmounts,
    },
    isLoading: [
      balancesLoading,
      userBalancesLoading,
      userLiquidityUsdLoading,
      userShareLoading,
      crvApyLoading,
      boostApyLoading,
    ].find(Boolean),
    error: [userBalancesError, userLiquidityUsdError, userShareError, crvApyError, boostApyError].find(Boolean),
  }
}

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
