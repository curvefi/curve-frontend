import { test } from 'vest'
import type { PoolParams } from '@evm-ui/queries/query-types'
import { amountValidationFn } from '@evm-ui/queries/validation/basic-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { recordEntries } from '@primitives/objects.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { PoolLiquidityQuoteParams } from './pool-liquidity-quote.query'

export const poolLiquidityValidationGroup = ({ chainId, poolAddress }: PoolParams) => {
  poolValidationGroup({ chainId, poolAddress })
  curveApiValidationGroup({ chainId }, { requireRpc: true })
}

export const poolLiquidityValidationSuite = createValidationSuite(poolLiquidityValidationGroup)

const poolLiquidityQuoteValidationGroup = ({
  chainId,
  poolAddress,
  inputCoin,
  outputCoin,
  inputAmount,
}: PoolLiquidityQuoteParams) => {
  poolLiquidityValidationGroup({ chainId, poolAddress })
  recordEntries({ inputCoin, outputCoin }).forEach(([field, coin]) =>
    test(field, () => {
      enforce(coin).isNumber().greaterThanOrEquals(0)
    }),
  )
  test('outputCoin', () => {
    enforce(outputCoin).notEquals(inputCoin)
  })
  test('inputAmount', () => {
    amountValidationFn(inputAmount)
    enforce(inputAmount).greaterThan(0)
  })
}

export const poolLiquidityQuoteValidationSuite = createValidationSuite(poolLiquidityQuoteValidationGroup)
