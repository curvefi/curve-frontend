import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const { useQuery: usePoolAmplificationQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.amplification', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const { address, curve, isCrypto } = requireLib('curveApi').getPool(poolAddress)
    const { contract } = curve.contracts[address]
    // StableSwap pools without A_precise() use stats.parameters().A.
    return !isCrypto && 'A_precise' in contract
      ? (decimal(((await contract.A_precise()) as bigint).toString()) ?? null)
      : null
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})

export const usePoolAmplification = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolAmplificationQuery, params, enabled)

export type PoolAmplification = Decimal | null
