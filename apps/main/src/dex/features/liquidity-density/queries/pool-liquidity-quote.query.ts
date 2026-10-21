import { hasWrapped } from '@/dex/pool.utils'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'
import { poolLiquidityQuoteValidationSuite } from './pool-liquidity.validation'

type PoolLiquidityQuoteQuery = PoolQuery & { inputCoin: number; outputCoin: number; inputAmount: Decimal }
export type PoolLiquidityQuoteParams = FieldsOf<PoolLiquidityQuoteQuery>

const { useQuery: usePoolLiquidityQuoteQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress, inputCoin, outputCoin, inputAmount }: PoolLiquidityQuoteParams) =>
    ({ name: 'pool.liquidityQuote', chainId, poolAddress, inputCoin, outputCoin, inputAmount }) as const,
  queryFn: async ({ poolAddress, inputCoin, outputCoin, inputAmount }: PoolLiquidityQuoteQuery) =>
    (await requireLib('curveApi')
      .getPool(poolAddress)
      [`swap${hasWrapped(requireLib('curveApi').getPool(poolAddress)) ? 'Wrapped' : ''}Expected`](
        inputCoin,
        outputCoin,
        inputAmount,
      )) as Decimal,
  validationSuite: poolLiquidityQuoteValidationSuite,
  category: 'dex.pool',
})

export const usePoolLiquidityQuote = (params: PoolLiquidityQuoteParams, enabled = true) =>
  useHydratedQuery(usePoolLiquidityQuoteQuery, params, enabled)
