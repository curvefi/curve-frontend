import { each, skipWhen, test } from 'vest'
import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import type { UserQuery } from '@/stellar/queries/root-keys'
import { validateAccount, validatePool } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import {
  poolAmountField,
  poolMaxAmountField,
  getPoolAmounts,
  type PoolForm,
} from '@ui/features/pool-forms/pool-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { validateLiquidityInputs, validateSlippage, type QuoteQuery } from './liquidity.validation'
export type { QuoteQuery, QuoteParams } from './liquidity.validation'

export type DepositMutation = {
  amounts: (Decimal | undefined)[]
  maxAmounts: (Decimal | undefined)[]
  decimals: number[]
  supply: Decimal
  slippage: Decimal
}
export type DepositForm = PoolForm & { supply: Decimal | undefined; slippage: Decimal }
export type DepositQuery = QuoteQuery & UserQuery & { minMint: Decimal; maxAmounts: (Decimal | undefined)[] }
export type DepositParams = FieldsOf<DeepPartial<DepositQuery>>
export type DepositFormQuery = DepositQuery & DepositMutation & { quote: Decimal; tokens: StellarContract[] }
export type DepositFormParams = FieldsOf<DeepPartial<DepositFormQuery>>

export const depositValidationSuite = createValidationSuite((params: DepositParams) => {
  validatePool(params)
  validateFundedInputs(params)
  validateAccount(params.account)
  test('minMint', 'Invalid minimum LP amount', () => {
    enforce(params.minMint).isDecimal().gte(0)
  })
})

type DepositInputs = Pick<DepositParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>

// Shared by disconnected quotes and form validation. Fee simulation also needs wallet balances.
const validateInputs = ({ amounts, decimals, supply, maxAmounts }: DepositInputs) => {
  validateLiquidityInputs({ amounts, decimals, supply }, true)
  each(amounts ?? [], (amount, i) => {
    const field = poolAmountField(i)
    skipWhen(maxAmounts?.[i] == null, () => {
      test(field, 'Insufficient token balance', () => {
        enforce(amount || '0').lte(maxAmounts![i]!)
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

const validateTokens = ({ tokens }: Pick<DepositFormParams, 'tokens'>) => {
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
  }: DepositFormParams) => {
    validatePool({ pool, network })
    validateAccount(account)
    validateSlippage(slippage)
    validateFundedInputs({ amounts, decimals, maxAmounts, supply })
    validateTokens({ tokens })
    test('quote', 'Deposit must leave LP after the permanent seed lock', () => {
      enforce(quote && +quote).gt(0)
    })
    test('minMint', 'Minimum LP does not match the accepted quote and slippage', () => {
      enforce(maybes([quote, slippage], calculateMinimumMint)).equals(minMint)
    })
  },
)
