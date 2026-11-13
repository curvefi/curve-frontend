import { each, skipWhen, test } from 'vest'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes, range, type Nullish } from '@primitives/objects.utils'
import { SWAP_FIELDS, type SwapAmountField, type SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { SwapParams, SwapQuoteParams, UserSwapParams } from './types'

const validateTokens = ({ fromIndex, toIndex, decimals, isWrapped }: SwapParams) => {
  test('isWrapped', 'Select a token representation', () => {
    enforce(isWrapped).isBoolean()
  })
  test('decimals', 'Token decimals are unavailable', () => {
    enforce(decimals).isArray()
    enforce(decimals?.length).gte(2)
  })
  each(decimals ?? [], precision =>
    test('decimals', 'Invalid token decimals', () => {
      enforce(precision).isNumber().gte(0)
      enforce(Number.isInteger(precision)).isTruthy()
    }),
  )
  test('fromIndex', 'Select different pool tokens', () => {
    enforce(fromIndex)
      .inside(range(decimals?.length ?? 0))
      .notEquals(toIndex)
  })
  test('toIndex', 'Select a receiving token', () => {
    enforce(toIndex).inside(range(decimals?.length ?? 0))
  })
}

const validateAmount = (field: SwapAmountField, amount: Decimal | Nullish, precision: number | Nullish) => {
  test(field, 'Enter an amount to swap', () => {
    enforce(amount).isDecimal().gt(0)
  })
  skipWhen(precision == null, () => {
    test(field, 'Amount exceeds token decimal precision', () => {
      enforce(amount).isDecimal({ decimal_digits: `0,${precision}` })
    })
  })
}

const validateReceive = ({ editedSide, outputAmount, maxOutput }: SwapQuoteParams) => {
  test('editedSide', 'Select an amount to edit', () => {
    enforce(editedSide).inside(['pay', 'receive'])
  })
  skipWhen(editedSide !== 'receive', () => {
    test('outputAmount', 'Pool reserve is unavailable', () => {
      enforce(maxOutput).isDecimal().gt(0)
    })
    test('outputAmount', 'Amount must be less than the available pool reserve', () => {
      enforce(outputAmount).lt(maxOutput!)
    })
  })
}

export const swapQuoteValidationSuite = createValidationSuite((params: SwapQuoteParams) => {
  poolValidationGroup(params)
  curveApiValidationGroup(params, { requireRpc: true })
  validateTokens(params)
  validateReceive(params)
  const fields = params.editedSide && SWAP_FIELDS[params.editedSide]
  if (fields) {
    const index = params[fields.amountIndexField]
    validateAmount(
      fields.amountField,
      params[fields.amountField],
      maybe(index, index => params.decimals?.[index]),
    )
  }
})

export const swapQueryValidationSuite = createValidationSuite((params: SwapParams) => {
  poolValidationGroup(params)
  curveApiValidationGroup(params, { requireRpc: true })
  validateTokens(params)
  validateAmount(
    'inputAmount',
    params.inputAmount,
    maybe(params.fromIndex, index => params.decimals?.[index]),
  )
  validateSlippage({ slippage: params.slippage })
})

export const userSwapParamsValidationSuite = createValidationSuite(({ userAddress, ...params }: UserSwapParams) => {
  swapQueryValidationSuite.run(params)
  evmAddressValidationGroup({ evmAddress: userAddress })
})

export const swapFormValidationSuite = createValidationSuite((values: SwapFormValues) => {
  const { inputAmount, outputAmount, fromIndex, toIndex, decimals, maxAmount, expectedOutput, slippage } = values
  validateTokens(values)
  validateReceive(values)
  validateAmount('inputAmount', inputAmount, decimals?.[fromIndex])
  validateAmount('outputAmount', outputAmount, decimals?.[toIndex])
  validateSlippage(values)
  skipWhen(maxAmount == null, () => {
    test('inputAmount', 'Insufficient token balance', () => {
      enforce(inputAmount).lte(maxAmount!)
    })
  })
  const minimum = maybes([expectedOutput, slippage, decimals?.[toIndex]], calculateMinimumReceived)
  test('root', 'Swap quote is unavailable', () => {
    enforce(expectedOutput).isDecimal().gt(0)
  })
  test('root', 'Minimum received must be positive', () => {
    enforce(minimum).isDecimal().gt(0)
  })
})

export const swapMutationValidationSuite = createValidationSuite((params: SwapFormValues & UserSwapParams) => {
  userSwapParamsValidationSuite.run(params)
  swapFormValidationSuite.run(params)
  test('maxAmount', 'Wallet balance is unavailable', () => {
    enforce(params.maxAmount).isDecimal().gte(0)
  })
})
