import { each, skipWhen, test } from 'vest'
import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import type { UserQuery } from '@/stellar/queries/root-keys'
import { validateAccount, validatePool } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import {
  poolAmountField,
  poolMaxAmountField,
  getPoolAmounts,
  type PoolForm,
} from '@ui/features/pool-forms/pool-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { decimalGreaterThan } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { validateLiquidityInputs, validateSlippage, type QuoteQuery } from './liquidity.validation'
export type { QuoteQuery, QuoteParams } from './liquidity.validation'
export type DepositQuery = QuoteQuery & UserQuery & { minMint: Decimal; maxAmounts: (Decimal | undefined)[] }
export type DepositParams = FieldsOf<DeepPartial<DepositQuery>>
export type DepositMutation = DepositQuery & { quote: Decimal; tokens: StellarContract[]; slippage: Decimal }
export type DepositForm = PoolForm & { supply: Decimal | undefined; slippage: Decimal }

export const depositValidationSuite = createValidationSuite((params: DepositQuery) => {
  validatePool(params)
  validateFundedInputs(params)
  validateAccount(params.account)
  test('minMint', 'Invalid minimum LP amount', () => {
    enforce(params.minMint).isDecimal().gte(0)
  })
})

type DepositInputs = {
  amounts: (Decimal | undefined)[] | undefined
  decimals: (number | undefined)[] | undefined
  supply: Decimal | undefined
  maxAmounts: (Decimal | undefined)[] | undefined
}

// Shared by disconnected quotes and form validation. Fee simulation also needs wallet balances.
const validateInputs = ({ amounts, decimals, supply, maxAmounts }: DepositInputs) => {
  validateLiquidityInputs({ amounts, decimals, supply }, true)
  each(amounts ?? [], (amount, i) => {
    const field = poolAmountField(i)
    skipWhen(maxAmounts?.[i] == null, () => {
      test(field, 'Insufficient token balance', () => {
        enforce(!decimalGreaterThan(amount || '0', maxAmounts![i]!)).isTruthy()
      })
    })
  })
}

const validateFundedInputs = (values: DepositInputs) => {
  validateInputs(values)
  each(values.decimals ?? [], (_, i) => {
    test(poolMaxAmountField(i), 'Wallet balance is unavailable', () => {
      enforce(values.maxAmounts?.[i]).isDecimal().gte(0)
    })
  })
}

const validateForm = (values: DepositForm) => {
  validateSlippage(values.slippage)
  validateInputs({
    decimals: values.decimals,
    supply: values.supply,
    amounts: getPoolAmounts(values, values.decimals?.length),
    maxAmounts: values.decimals?.map((_, index) => values[poolMaxAmountField(index)]),
  })
}

export const depositFormValidationSuite = createValidationSuite(validateForm)

const validateTokens = ({ tokens }: { tokens: StellarContract[] }) => {
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
  }: DepositMutation) => {
    validatePool({ pool, network })
    validateAccount(account)
    validateSlippage(slippage)
    validateFundedInputs({ amounts, decimals, maxAmounts, supply })
    validateTokens({ tokens })
    test('quote', 'Deposit must leave LP after the permanent seed lock', () => {
      enforce(decimalGreaterThan(quote, '0')).isTruthy()
    })
    test('minMint', 'Minimum LP does not match the accepted quote and slippage', () => {
      enforce(calculateMinimumMint(quote, slippage)).equals(minMint)
    })
  },
)
