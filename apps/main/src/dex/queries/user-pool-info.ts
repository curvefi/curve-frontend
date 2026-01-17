import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { log } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@ui-kit/lib/model'
import { userPoolValidationSuite } from '@ui-kit/lib/model/query/user-pool-validation'
import { Chain, type Address } from '@ui-kit/utils'
import { usePoolTokenDepositBalances } from '../hooks/usePoolTokenDepositBalances'
import { fulfilledValue, isValidAddress } from '../utils'

async function userPoolLiquidityUsd(pool: PoolTemplate, userAddress: Address) {
  let liquidityUsd = ''

  try {
    log('userPoolLiquidityUsd', pool.name, userAddress)
    const fetchedLiquidityUsd = await pool.userLiquidityUSD(userAddress)

    if (fetchedLiquidityUsd !== 'NaN') {
      liquidityUsd = fetchedLiquidityUsd
    }

    return liquidityUsd
  } catch (error) {
    log('userPoolLiquidityUsd', error, pool.name)
  }
}

export async function userPoolRewardCrvApy(pool: PoolTemplate, userAddress: Address) {
  let userCrvApy = 0

  if (isValidAddress(pool.gauge.address) && !pool.rewardsOnly()) {
    const fetchedCurrentCrvApy = await pool.userCrvApy(userAddress)
    if (String(fetchedCurrentCrvApy) !== 'NaN') {
      userCrvApy = fetchedCurrentCrvApy
    }
  }
  return userCrvApy
}

export async function userPoolBoost(chainId: number, pool: PoolTemplate, userAddress: Address) {
  if (chainId !== Chain.Ethereum || !isValidAddress(pool.gauge.address)) {
    return Promise.resolve('')
  }

  const boost = await pool.userBoost(userAddress)
  if (boost && boost === 'NaN') {
    return '0'
  }
  return boost
}

const { useQuery: useUserPoolInfoQuery, invalidate: invalidateUserPoolInfoQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'pool-info'] as const,
  queryFn: async ({ chainId, poolId, userAddress }: UserPoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)

    const [userPoolWithdrawResult, liquidityUsdResult, userShareResult, userCrvApyResult, userPoolBoostResult] =
      await Promise.allSettled([
        pool.userBalances(userAddress),
        userPoolLiquidityUsd(pool, userAddress),
        pool.userShare(userAddress),
        userPoolRewardCrvApy(pool, userAddress),
        userPoolBoost(chainId, pool, userAddress),
      ])

    return {
      userCrvApy: {
        crvApy: fulfilledValue(userCrvApyResult) ?? 0,
        boostApy: fulfilledValue(userPoolBoostResult) ?? '',
      },
      userLiquidityUsd: fulfilledValue(liquidityUsdResult) ?? '',
      userShare: fulfilledValue(userShareResult) ?? null,
      userWithdrawAmounts: fulfilledValue(userPoolWithdrawResult) ?? [],
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

  const { data: details, isLoading: detailsLoading } = useUserPoolInfoQuery(params, enabled && hasBalance)

  const data = details ?? DEFAULT_USER_POOL_INFO

  return {
    data,
    isLoading: balancesLoading || (hasBalance && detailsLoading),
  }
}
