import { getAddress } from 'viem'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { PromisePool } from '@supercharge/promise-pool'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { decimal, decimalGreaterThan, decimalSum, ZERO } from '@ui/lib/decimal'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { getPool } from '../pool.utils'

const {
  useQuery: useUserLitePoolPositionsQuery,
  queryKey: getUserLitePoolPositionsQueryKey,
  invalidate: invalidateUserLitePoolPositions,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    ({ name: 'getUserLitePoolPositions', chainId, userAddress }) as const,
  queryFn: async ({ chainId, userAddress }: UserChainQuery) => {
    const curve = requireLib('curveApi')
    const poolIds = await curve.getUserPoolListByLiquidity(userAddress)
    const { results } = await PromisePool.for(poolIds)
      .withConcurrency(10)
      .process(async poolId => {
        const pool = getPool(poolId, curve)
        const { lpToken, gauge } = (await pool.wallet.lpTokenBalances(userAddress)) as Record<string, string>
        const totalBalance = decimalSum(decimal(lpToken), decimal(gauge ?? ZERO))
        return { address: getAddress(pool.address), lpTokenAddress: getAddress(pool.lpToken), totalBalance }
      })

    return {
      chainId,
      user: userAddress,
      positions: results.filter(({ totalBalance }) => decimalGreaterThan(totalBalance, ZERO)),
    }
  },
  validationSuite: createValidationSuite((params: UserChainParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
  }),
  category: 'dex.user',
})

export { getUserLitePoolPositionsQueryKey, invalidateUserLitePoolPositions }

export function useUserLitePoolPositions({ chainId, userAddress }: UserChainParams, enabled = true) {
  const { isHydrated } = useCurve()
  return useUserLitePoolPositionsQuery({ chainId, userAddress }, enabled && isHydrated)
}

export type UserLitePoolPositions = QueryData<typeof useUserLitePoolPositions>
