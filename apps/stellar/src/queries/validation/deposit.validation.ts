import { skipWhen, test } from 'vest'
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { isAccountAddress, isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { MAX_I128, calculateMinimumMint } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolQuery, TokenQuery, UserQuery } from '@/stellar/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
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
export type DepositQuery = QuoteQuery & UserQuery & { minMint: Decimal; maxAmounts: Decimal[] }
export type DepositParams = FieldsOf<DepositQuery>
export type DepositSubmission = DepositQuery & { quote: Decimal; tokens: StellarContract[]; slippage: Decimal }
export type DepositFormValues = {
  amounts: (Decimal | undefined)[] | undefined
  decimals: number[] | undefined
  maxAmounts: Decimal[] | undefined
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

// Shared by disconnected quotes and form validation. Fee simulation also needs wallet balances.
const validateInputs = ({
  amounts,
  decimals,
  supply,
  maxAmounts,
}: Pick<DepositFormValues, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>) => {
  test('supply', 'Pool supply is unavailable', () => {
    enforce(supply).isDecimal().gte(0)
  })
  test('amounts', 'Pool data is unavailable', () => {
    enforce(decimals?.length).isNumber().equals(amounts?.length)
  })
  test('amounts', 'Enter valid non-negative amounts', () => {
    amounts?.forEach(amount =>
      enforce(amount || '0')
        .isDecimal({ decimal_digits: '0,' })
        .gte(0),
    )
  })
  test('amounts', 'Amounts exceed token decimal precision', () => {
    amounts?.forEach((amount, i) => enforce(amount || '0').isDecimal({ decimal_digits: `0,${decimals?.[i] ?? 0}` }))
  })
  test('amounts', 'Amounts exceed the maximum supported token amount', () => {
    enforce(
      amounts?.every((amount, i) => !decimalGreaterThan(amount || '0', fromWei(MAX_I128, decimals?.[i] ?? 0))),
    ).isTruthy()
  })
  test('amounts', 'Enter an amount to deposit', () => {
    enforce(amounts?.some(amount => decimalGreaterThan(amount ?? '0', '0'))).isTruthy()
  })
  test('amounts', 'Seed deposits require a positive amount of every coin', () => {
    enforce(
      supply == null ||
        !decimalEqual(supply, '0') ||
        decimals?.every((_, i) => decimalGreaterThan(amounts?.[i] || '0', '0')),
    ).isTruthy()
  })
  skipWhen(!maxAmounts, () => {
    test('amounts', 'Insufficient token balance', () => {
      enforce(amounts?.every((amount, i) => !decimalGreaterThan(amount || '0', maxAmounts![i]))).isTruthy()
    })
  })
}
const validateFundedInputs = (values: Pick<DepositFormValues, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>) => {
  validateInputs(values)
  test('maxAmounts', 'Wallet balances are unavailable', () => {
    enforce(values.maxAmounts?.length).isNumber().equals(values.decimals?.length)
  })
}
const validateForm = (values: DepositFormValues) => {
  validateSlippage(values.slippage)
  validateFundedInputs(values)
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
    validateForm({ amounts, decimals, maxAmounts, supply, slippage })
    validateTokens({ tokens })
    test('quote', 'Deposit must leave LP after the permanent seed lock', () => {
      enforce(decimalGreaterThan(quote, '0')).isTruthy()
    })
    test('minMint', 'Minimum LP does not match the accepted quote and slippage', () => {
      enforce(calculateMinimumMint(quote, slippage)).equals(minMint)
    })
  },
)
