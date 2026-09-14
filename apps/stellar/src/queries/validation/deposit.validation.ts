import { each, skipWhen, test } from 'vest'
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { isAccountAddress, isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { MAX_I128, calculateMinimumMint } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolQuery, TokenQuery, UserQuery } from '@/stellar/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import {
  depositAmountField,
  depositMaxAmountField,
  getDepositAmounts,
  type DepositFormValues as DepositTokenValues,
} from '@ui/features/forms/deposit/deposit-form.utils'
import { MAX_SLIPPAGE, MIN_SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { decimalEqual, decimalGreaterThan, fromWei } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

export type { PoolQuery, PoolParams, TokenQuery, TokenParams } from '@/stellar/queries/root-keys'
export type BalanceQuery = TokenQuery & UserQuery & { decimals: number }
export type BalanceParams = FieldsOf<BalanceQuery>
export type QuoteQuery = PoolQuery & { amounts: (Decimal | undefined)[]; decimals: number[]; supply: Decimal }
export type QuoteParams = FieldsOf<QuoteQuery>
export type DepositQuery = QuoteQuery & UserQuery & { minMint: Decimal; maxAmounts: (Decimal | undefined)[] }
export type DepositParams = FieldsOf<DepositQuery>
export type DepositSubmission = DepositQuery & { quote: Decimal; tokens: StellarContract[]; slippage: Decimal }
export type DepositFormValues = DepositTokenValues & {
  decimals: number[] | undefined
  supply: Decimal | undefined
  slippage: Decimal
}

const validateNetwork = (network: string) =>
  test('network', 'Unsupported Stellar network', () => {
    enforce(!!network && network in STELLAR_NETWORKS).isTruthy()
  })
const validateAccount = (account: StellarAddress | undefined) =>
  test('account', 'Connect a Stellar wallet', () => {
    enforce(!!account && isAccountAddress(account)).isTruthy()
  })
const validatePool = ({ network, pool }: PoolQuery) => {
  validateNetwork(network)
  test('pool', 'Invalid Stellar pool address', () => {
    enforce(!!pool && isContractAddress(pool)).isTruthy()
  })
}
const validateToken = ({ network, token }: TokenQuery) => {
  validateNetwork(network)
  test('token', 'Invalid Stellar token address', () => {
    enforce(!!token && isContractAddress(token)).isTruthy()
  })
}
const validateSlippage = (slippage: Decimal) =>
  test('slippage', 'Invalid slippage tolerance', () => {
    enforce(slippage).isDecimal().gte(MIN_SLIPPAGE).lte(MAX_SLIPPAGE)
  })
const validateQuote = (params: QuoteQuery) => {
  validatePool(params)
  validateInputs({ ...params, maxAmounts: undefined })
}
export const poolValidationSuite = createValidationSuite(validatePool)
export const tokenValidationSuite = createValidationSuite(validateToken)
export const balanceValidationSuite = createValidationSuite((params: BalanceQuery) => {
  validateToken(params)
  validateAccount(params.account)
  test('decimals', 'Token decimals are unavailable', () => {
    enforce(params.decimals).isNumber()
  })
})
export const quoteValidationSuite = createValidationSuite(validateQuote)
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
  decimals: number[] | undefined
  supply: Decimal | undefined
  maxAmounts: (Decimal | undefined)[] | undefined
}

// Shared by disconnected quotes and form validation. Fee simulation also needs wallet balances.
const validateInputs = ({ amounts, decimals, supply, maxAmounts }: DepositInputs) => {
  test('supply', 'Pool supply is unavailable', () => {
    enforce(supply).isDecimal().gte(0)
  })
  test('root', 'Pool data is unavailable', () => {
    enforce(decimals?.length).isNumber().equals(amounts?.length)
    decimals?.forEach(precision => enforce(precision).isNumber())
  })
  each(amounts ?? [], (amount, i) => {
    const field = depositAmountField(i)
    test(field, 'Enter a valid non-negative amount', () => {
      enforce(amount || '0')
        .isDecimal({ decimal_digits: '0,' })
        .gte(0)
    })
    maybe(decimals?.[i], precision => {
      test(field, 'Amount exceeds token decimal precision', () => {
        enforce(amount || '0').isDecimal({ decimal_digits: `0,${precision}` })
      })
      test(field, 'Amount exceeds the maximum supported token amount', () => {
        enforce(!decimalGreaterThan(amount || '0', fromWei(MAX_I128, precision))).isTruthy()
      })
    })
    skipWhen(maxAmounts?.[i] == null, () => {
      test(field, 'Insufficient token balance', () => {
        enforce(!decimalGreaterThan(amount || '0', maxAmounts![i]!)).isTruthy()
      })
    })
  })
  test('root', 'Enter an amount to deposit', () => {
    enforce(amounts?.some(amount => decimalGreaterThan(amount ?? '0', '0'))).isTruthy()
  })
  test('root', 'Seed deposits require a positive amount of every coin', () => {
    enforce(
      supply == null ||
        !decimalEqual(supply, '0') ||
        decimals?.every((_, i) => decimalGreaterThan(amounts?.[i] || '0', '0')),
    ).isTruthy()
  })
}
const validateFundedInputs = (values: DepositInputs) => {
  validateInputs(values)
  each(values.decimals ?? [], (_, i) => {
    test(depositMaxAmountField(i), 'Wallet balance is unavailable', () => {
      enforce(values.maxAmounts?.[i]).isDecimal().gte(0)
    })
  })
}
const validateForm = (values: DepositFormValues) => {
  validateSlippage(values.slippage)
  validateFundedInputs({
    decimals: values.decimals,
    supply: values.supply,
    amounts: getDepositAmounts(values, values.decimals?.length),
    maxAmounts: values.decimals?.map((_, index) => values[depositMaxAmountField(index)]),
  })
}
export const depositFormValidationSuite = createValidationSuite(validateForm)

const validateTokens = ({ tokens }: { tokens: StellarContract[] }) => {
  enforce(tokens?.length).isNumber().gt(0)
}

export const depositSubmissionValidationSuite = createValidationSuite(
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
  }: DepositSubmission) => {
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
