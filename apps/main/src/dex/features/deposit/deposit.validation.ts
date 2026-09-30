import { skipWhen, test } from 'vest'
import type { DepositFormValues, DepositParams } from '@/dex/features/deposit/types'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { MAX_SLIPPAGE, MIN_SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolAmounts, poolAmountField, poolMaxAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'

export const depositQueryValidationSuite = createValidationSuite((params: DepositParams) => {
  poolValidationGroup(params)
  curveApiValidationGroup(params, { requireRpc: true })
  evmAddressValidationGroup({ evmAddress: params.userAddress })
  const amounts = getPoolAmounts(params, params.decimals?.length)
  test('root', 'Enter an amount to deposit', () => {
    enforce(amounts?.some(amount => +(amount ?? '0') > 0)).equals(true)
  })
  test('slippage', () => {
    enforce(params.slippage).isDecimal().gte(MIN_SLIPPAGE).lte(MAX_SLIPPAGE)
  })
})

export const depositFormValidationSuite = createValidationSuite((values: DepositFormValues) => {
  const amounts = getPoolAmounts(values, values.decimals?.length)
  test('root', 'Enter an amount to deposit', () => {
    enforce(amounts?.some(amount => +(amount ?? '0') > 0)).equals(true)
  })
  test('slippage', 'Invalid slippage tolerance', () => {
    enforce(values.slippage).isDecimal().gte(MIN_SLIPPAGE).lte(MAX_SLIPPAGE)
  })
  amounts?.forEach((amount, index) => {
    test(poolAmountField(index), 'Enter a valid non-negative amount', () => {
      enforce(amount || '0')
        .isDecimal({ decimal_digits: '0,' })
        .gte(0)
    })
    const decimals = values.decimals?.[index]
    skipWhen(decimals == null, () => {
      test(poolAmountField(index), 'Amount exceeds token decimal precision', () => {
        enforce(amount || '0').isDecimal({ decimal_digits: `0,${decimals}` })
      })
    })
    const maxAmount = values[poolMaxAmountField(index)]
    skipWhen(maxAmount == null, () => {
      test(poolAmountField(index), 'Insufficient token balance', () => {
        enforce(amount || '0').lte(maxAmount)
      })
    })
  })
})
