import { each, test } from 'vest'
import type { DepositForm, DepositMutationParams, DepositParams } from '@/stellar/features/deposit/types'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { validateAccount, validatePool } from '@/stellar/queries/validation/pool.validation'
import { maybe, maybes, notFalsyArray } from '@primitives/objects.utils'
import { poolAmountField, poolMaxAmountField, getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateLiquidityInputs, validateSlippage } from './liquidity.validation'

export const depositValidationSuite = createValidationSuite(
  ({ pool, network, account, minMint, ...inputs }: DepositParams) => {
    validatePool({ pool, network })
    validateFundedInputs(inputs)
    validateAccount(account)
    test('minMint', 'Invalid minimum LP amount', () => {
      enforce(minMint).isDecimal().gte(0)
    })
  },
)

type DepositInputs = Pick<DepositParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>

// Shared by disconnected quotes and form validation. Fee simulation also needs wallet balances.
const validateInputs = ({ amounts, decimals, supply, maxAmounts }: DepositInputs) => {
  validateLiquidityInputs({ amounts, decimals, supply, isDeposit: true })
  each(notFalsyArray(amounts), (amount, i) => {
    const field = poolAmountField(i)
    maybe(maxAmounts?.[i], maxAmount => {
      test(field, 'Insufficient token balance', () => {
        enforce(amount || '0').lte(maxAmount)
      })
    })
  })
}

const validateFundedInputs = ({ decimals, maxAmounts, ...inputs }: DepositInputs) => {
  validateInputs({ decimals, maxAmounts, ...inputs })
  each(notFalsyArray(decimals), (_, i) => {
    test(poolMaxAmountField(i), 'Wallet balance is unavailable', () => {
      enforce(maxAmounts?.[i]).isDecimal().gte(0)
    })
  })
}

const validateForm = ({ decimals, supply, slippage, ...values }: DepositForm) => {
  validateSlippage(slippage)
  validateInputs({
    decimals,
    supply,
    amounts: getPoolAmounts(values, decimals?.length),
    maxAmounts: decimals?.map((_, index) => values[poolMaxAmountField(index)]),
  })
}

export const depositFormValidationSuite = createValidationSuite(validateForm)

const validateTokens = ({ tokens }: Pick<DepositMutationParams, 'tokens'>) => {
  enforce(tokens?.length).isNumber().gt(0)
}

export const depositMutationValidationSuite = createValidationSuite(
  ({
    pool,
    amounts,
    decimals,
    maxAmounts,
    network,
    supply,
    minMint,
    slippage,
    tokens,
    quote,
    account,
  }: DepositMutationParams) => {
    validatePool({ pool, network })
    validateAccount(account)
    validateSlippage(slippage)
    validateFundedInputs({ amounts, decimals, maxAmounts, supply })
    validateTokens({ tokens })
    test('quote', 'Deposit must leave LP after the permanent seed lock', () => {
      enforce(maybe(quote, quote => +quote)).gt(0)
    })
    test('minMint', 'Minimum LP does not match the accepted quote and slippage', () => {
      enforce(maybes([quote, slippage], calculateMinimumMint)).equals(minMint)
    })
  },
)
