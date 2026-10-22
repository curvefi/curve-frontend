import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { decimal } from '@ui/lib/decimal'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

export const { useQuery: usePoolInvariant } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.invariant', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const { address, curve, isCrypto } = requireLib('curveApi').getPool(poolAddress)
    const { contract } = curve.contracts[address] // we call the internal curvejs contract because the lib doesn't support A_precise
    const d = isCrypto ? ((await contract.D?.()) as bigint) : null // crypto pools without D() use the computed invariant.
    return decimal(d) ?? null
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})
