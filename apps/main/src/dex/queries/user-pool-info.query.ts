import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@ui-kit/lib/model'
import { userPoolValidationSuite } from '@ui-kit/lib/model/query/user-pool-validation'
import { Chain, decimal } from '@ui-kit/utils'
import { usePoolTokenDepositBalances } from '../hooks/usePoolTokenDepositBalances'
import { isValidAddress } from '../utils'

export async function userPoolRewardCrvApy(pool: PoolTemplate, userAddress: Address) {
  if (!isValidAddress(pool.gauge.address) || pool.rewardsOnly()) return 0
  const result = await pool.userCrvApy(userAddress)
  return String(result) === 'NaN' ? 0 : result
}

export async function userPoolBoost(chainId: number, pool: PoolTemplate, userAddress: Address) {
  if (chainId !== Chain.Ethereum || !isValidAddress(pool.gauge.address)) return ''
  const result = await pool.userBoost(userAddress)
  return result === 'NaN' ? '0' : result
}

const { useQuery: useUserPoolInfoQuery, invalidate: invalidateUserPoolInfoQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'pool-info'] as const,
  queryFn: async ({ chainId, poolId, userAddress }: UserPoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)

    const [userWithdrawAmounts, userLiquidityUsd, userShare, crvApy, boostApy] = await Promise.all([
      pool.userBalances(userAddress),
      pool
        .userLiquidityUSD(userAddress)
        .catch(() => 'NaN')
        .then((x) => decimal(x)),
      pool.userShare(userAddress),
      userPoolRewardCrvApy(pool, userAddress),
      userPoolBoost(chainId, pool, userAddress),
    ])

    return {
      userCrvApy: { crvApy, boostApy },
      userLiquidityUsd,
      userShare,
      userWithdrawAmounts,
    }
  },
  staleTime: '1m',
  validationSuite: userPoolValidationSuite,
})

export { invalidateUserPoolInfoQuery }

const DEFAULT_USER_POOL_INFO = {
  userCrvApy: { crvApy: 0, boostApy: '' },
  userLiquidityUsd: '',
  userShare: null,
  userWithdrawAmounts: [],
}

/** Hook to get user pool info including balances and details */
export const useUserPoolInfo = (params: UserPoolParams, enabled = true) => {
  const { lpTokenBalance, gaugeTokenBalance, isLoading: balancesLoading } = usePoolTokenDepositBalances(params, enabled)

  const hasBalance = +(lpTokenBalance ?? 0) > 0 || +(gaugeTokenBalance ?? 0) > 0

  const { data: details, isLoading: detailsLoading, error } = useUserPoolInfoQuery(params, enabled && hasBalance)

  const data = details ?? DEFAULT_USER_POOL_INFO

  return {
    data,
    isLoading: balancesLoading || (hasBalance && detailsLoading),
    error,
  }
}
