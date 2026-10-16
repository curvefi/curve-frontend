import { test } from 'vest'
import { hasWrapped } from '@/dex/pool.utils'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolQuery } from '@evm-ui/queries/query-types'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type PoolLiquidityQuoteQuery = PoolQuery & { inputCoin: number; outputCoin: number; inputAmount: string }
type PoolLiquidityQuoteParams = FieldsOf<PoolLiquidityQuoteQuery>

const { useQuery: usePoolLiquidityQuoteQuery } = queryFactory({
  queryKey: ({ chainId, poolId, inputCoin, outputCoin, inputAmount }: PoolLiquidityQuoteParams) =>
    ({ name: 'pool.liquidityQuote', chainId, poolId, inputCoin, outputCoin, inputAmount }) as const,
  queryFn: async ({ poolId, inputCoin, outputCoin, inputAmount }: PoolLiquidityQuoteQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const {
      wrappedCoins: { length: coinCount },
    } = pool
    if (inputCoin >= coinCount || outputCoin >= coinCount) {
      throw new NoRetryError('The pair is not in this pool')
    }
    const amount = BigInt(inputAmount)
    const outputAmount = hasWrapped(pool)
      ? await pool.swapWrappedExpectedBigInt(inputCoin, outputCoin, amount)
      : await pool.swapExpectedBigInt(inputCoin, outputCoin, amount)
    return { inputCoin, outputCoin, inputAmount, outputAmount: outputAmount.toString() }
  },
  validationSuite: createValidationSuite((params: PoolLiquidityQuoteParams) => {
    const { inputCoin, outputCoin, inputAmount } = params
    poolValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
    test('inputCoin', () => {
      enforce(inputCoin).isNumber().greaterThanOrEquals(0)
      enforce(Number.isInteger(inputCoin)).isTruthy()
    })
    test('outputCoin', () => {
      enforce(outputCoin).isNumber().greaterThanOrEquals(0).notEquals(inputCoin)
      enforce(Number.isInteger(outputCoin)).isTruthy()
    })
    test('inputAmount', () => {
      enforce(inputAmount)
        .isString()
        .matches(/^[1-9]\d*$/)
    })
  }),
  category: 'dex.pool',
})

export const usePoolLiquidityQuote = (params: PoolLiquidityQuoteParams, enabled = true) =>
  useHydratedQuery(usePoolLiquidityQuoteQuery, params, enabled)

export type PoolLiquidityQuote = QueryData<typeof usePoolLiquidityQuote>
