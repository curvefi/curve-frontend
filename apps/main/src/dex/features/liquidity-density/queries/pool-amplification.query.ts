import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { decimal } from '@ui/lib/decimal'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

export const { useQuery: usePoolAmplification } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.amplification', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const { address, curve, isCrypto } = requireLib('curveApi').getPool(poolAddress)
    const { contract } = curve.contracts[address] // we call the internal curvejs contract because the lib doesn't support A_precise
    const a = isCrypto ? null : ((await contract.A_precise?.()) as bigint) // StableSwap pools without A_precise() use stats.parameters().A.
    return decimal(a) ?? null
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})
