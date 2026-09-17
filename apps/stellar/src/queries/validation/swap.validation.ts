import { skipWhen, test } from 'vest'
import type { PoolQuery, UserQuery } from '@/stellar/queries/root-keys'
import { maybe, maybes } from '@primitives/objects.utils'
import {
  SWAP_FIELDS,
  type SwapAmountField,
  type SwapFormValues,
  type SwapMutation,
} from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { validateAmount, validateSlippage } from './liquidity.validation'
import { validateAccount, validatePool } from './pool.validation'

export type { SwapFormValues, SwapMutation } from '@ui/features/pool-forms/swap/swap-form.utils'
export type SwapQuoteQuery = PoolQuery &
  Pick<SwapMutation, 'fromIndex' | 'toIndex' | 'decimals' | 'inputAmount' | 'outputAmount'> &
  Pick<SwapFormValues, 'maxOutput' | 'editedSide'>
export type SwapQuoteParams = FieldsOf<DeepPartial<SwapQuoteQuery>>
export type SwapQuery = PoolQuery & UserQuery & Omit<SwapMutation, 'outputAmount' | 'slippage'>
export type SwapParams = FieldsOf<DeepPartial<SwapQuery>>

type SwapInputs = Pick<SwapQuoteParams, 'fromIndex' | 'toIndex' | 'inputAmount' | 'outputAmount' | 'decimals'>

const validateTokens = ({ fromIndex, toIndex, decimals }: SwapInputs) => {
  test('decimals', 'Token decimals are unavailable', () => {
    enforce(decimals?.length).isNumber().gte(2).lte(8)
    decimals?.forEach(precision => enforce(precision).isNumber())
  })
  test('fromIndex', 'Select different pool tokens', () => {
    enforce(fromIndex).isNumber().equals(maybe(fromIndex, Math.trunc)).gte(0).lt(decimals?.length).notEquals(toIndex)
  })
  test('toIndex', 'Select a receiving token', () => {
    enforce(toIndex).isNumber().equals(maybe(toIndex, Math.trunc)).gte(0).lt(decimals?.length)
  })
}

const validateSwapAmount = (
  { fromIndex, toIndex, inputAmount, outputAmount, decimals }: SwapInputs,
  field: SwapAmountField,
) => {
  const precision = maybe(field === 'inputAmount' ? fromIndex : toIndex, index => decimals?.[index])
  const amount = { inputAmount, outputAmount }[field]
  test(field, 'Enter an amount to swap', () => {
    enforce(amount).isDecimal().gt(0)
  })
  validateAmount(field, amount, precision)
}

const validateBalance = ({ inputAmount, maxAmount }: Pick<SwapParams, 'inputAmount' | 'maxAmount'>) => {
  skipWhen(maxAmount == null, () => {
    test('inputAmount', 'Insufficient token balance', () => {
      enforce(+(inputAmount || '0')).lte(maybe(maxAmount, value => +value))
    })
  })
}

const validateReserve = ({ outputAmount, maxOutput }: Pick<SwapQuoteParams, 'outputAmount' | 'maxOutput'>) => {
  test('maxOutput', 'Pool reserve is unavailable', () => {
    enforce(maxOutput).isDecimal().gte(0)
  })
  test('outputAmount', 'Amount must be less than the available pool reserve', () => {
    enforce(+(outputAmount || '0')).lt(maybe(maxOutput, value => +value))
  })
}

export const swapQuoteValidationSuite = createValidationSuite(
  ({ network, pool, editedSide, ...values }: SwapQuoteParams) => {
    validatePool({ network, pool })
    validateTokens(values)
    test('editedSide', 'Select an amount to edit', () => {
      enforce(editedSide).inside(['pay', 'receive'])
    })
    maybe(editedSide, side => validateSwapAmount(values, SWAP_FIELDS[side].amountField))
    skipWhen(editedSide !== 'receive', () => validateReserve(values))
  },
)

export const swapFormValidationSuite = createValidationSuite(({ editedSide, slippage, ...values }: SwapFormValues) => {
  test('editedSide', 'Select an amount to edit', () => {
    enforce(editedSide).inside(['pay', 'receive'])
  })
  validateTokens(values)
  skipWhen(editedSide !== 'pay' && values.inputAmount == null, () => validateSwapAmount(values, 'inputAmount'))
  skipWhen(editedSide !== 'receive' && values.outputAmount == null, () => validateSwapAmount(values, 'outputAmount'))
  skipWhen(editedSide !== 'receive', () => validateReserve(values))
  validateBalance(values)
  validateSlippage(slippage)
})

const validateSwap = ({ network, pool, account, maxAmount, minimum, ...values }: SwapParams) => {
  validatePool({ network, pool })
  validateTokens(values)
  validateSwapAmount(values, 'inputAmount')
  validateAccount(account)
  validateBalance({ inputAmount: values.inputAmount, maxAmount })
  test('maxAmount', 'Wallet balance is unavailable', () => {
    enforce(maxAmount).isDecimal().gte(0)
  })
  validateAmount(
    'minimum',
    minimum,
    maybe(values.toIndex, index => values.decimals?.[index]),
  )
  test('minimum', 'Minimum received is unavailable', () => {
    enforce(minimum).isDecimal().gte(0)
  })
}

export const swapValidationSuite = createValidationSuite(validateSwap)
export const swapMutationValidationSuite = createValidationSuite(
  ({ outputAmount, slippage, ...values }: SwapParams & FieldsOf<SwapMutation>) => {
    validateSwap(values)
    validateSlippage(slippage)
    test('outputAmount', 'Swap must return a positive amount', () => {
      enforce(outputAmount).isDecimal().gt(0)
    })
    test('minimum', 'Minimum received does not match the accepted quote and slippage', () => {
      const precision = maybe(values.toIndex, index => values.decimals?.[index])
      enforce(maybes([outputAmount, slippage, precision], calculateMinimumReceived)).equals(values.minimum)
    })
  },
)
