import type { ContractMethod } from 'ethers'
import { isValidAddress } from '@/dex/utils'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

const NOT_AVAILABLE = { totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' } as const

const { useQuery: usePoolTotalStakedQuery, invalidate: invalidatePoolTotalStaked } = queryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'totalStaked', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    if (!isValidAddress(pool.gauge.address)) return NOT_AVAILABLE

    try {
      const { curve } = pool
      const [lpTokenTotalSupply, gaugeTotalSupply] = await Promise.all(
        [pool.lpToken, pool.gauge.address].map(address =>
          curve.contracts[address].contract
            .getFunction<ContractMethod<unknown[], bigint>>('totalSupply')
            .staticCall(curve.constantOptions),
        ),
      )

      const isZero = Number(lpTokenTotalSupply) === 0 && Number(gaugeTotalSupply) === 0
      const totalStakedPercent = isZero ? 0 : (Number(gaugeTotalSupply) / Number(lpTokenTotalSupply)) * 100
      return { totalStakedPercent, gaugeTotalSupply: Number(gaugeTotalSupply) }
    } catch (error) {
      console.error(error)
      return NOT_AVAILABLE
    }
  },
  validationSuite: curvePoolValidationSuite,
})

export { invalidatePoolTotalStaked }

export function usePoolTotalStaked(params: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolTotalStakedQuery(params, isHydrated)
}
