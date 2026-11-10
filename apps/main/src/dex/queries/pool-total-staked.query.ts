import type { ContractMethod } from 'ethers'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { isValidAddress } from '@evm-ui/utils'

const NOT_AVAILABLE = { totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' } as const

export const { useQuery: usePoolTotalStaked, invalidate: invalidatePoolTotalStaked } = hydratedQueryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'totalStaked', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
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
