import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const { useQuery: usePoolInvariantQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.invariant', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const { address, curve, isCrypto } = requireLib('curveApi').getPool(poolAddress)
    const { contract } = curve.contracts[address]
    // Crypto pools without D() use the computed invariant.
    return isCrypto && 'D' in contract ? (decimal((await contract.D()) as bigint) ?? null) : null
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})

export const usePoolInvariant = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolInvariantQuery, params, enabled)

export type PoolInvariant = Decimal | null
