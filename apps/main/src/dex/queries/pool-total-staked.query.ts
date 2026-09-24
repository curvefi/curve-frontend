import type { ContractMethod } from 'ethers'
import { isValidAddress } from '@/dex/utils'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'
import { type PoolParams, type PoolQuery, rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

const NOT_AVAILABLE = { totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' } as const

const { useQuery: usePoolTotalStakedQuery, invalidate: invalidatePoolTotalStaked } = queryFactory({
  category: 'dex.pool',
  queryKey: (params: PoolParams) => [...rootKeys.pool(params), 'totalStaked'] as const,
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
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params, { requireRpc: true })
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

export { invalidatePoolTotalStaked }

export function usePoolTotalStaked(params: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolTotalStakedQuery(params, isHydrated)
}
