import { BigNumber } from 'bignumber.js'
import { test } from 'vest'
import type { StellarAddress } from '@/features/connect-wallet/address'
import { isAccountAddress, isContractAddress } from '@/features/connect-wallet/stellar-wallet-kit'
import { MAX_I128, minimumMint } from '@/lib/amounts'
import { STELLAR_NETWORKS } from '@/lib/networks'
import type { PoolQuery, TokenQuery, UserQuery } from '@/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { MAX_SLIPPAGE, MIN_SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

export type { PoolQuery, PoolParams, TokenQuery, TokenParams } from '@/queries/root-keys'
export type BalanceQuery = TokenQuery & UserQuery & { decimals: number }
export type BalanceParams = FieldsOf<BalanceQuery>
export type QuoteQuery = PoolQuery & { amounts: (Decimal | undefined)[]; decimals: number[]; supply: Decimal }
export type QuoteParams = FieldsOf<QuoteQuery>
export type DepositQuery = QuoteQuery & UserQuery & { minMint: Decimal }
export type DepositParams = FieldsOf<DepositQuery>
export type DepositSubmission = DepositQuery & {
  quote: Decimal
  tokens: StellarAddress[]
  slippage: Decimal
  maxAmounts: Decimal[]
}
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
  validateQuote(params)
  validateAccount(params.account)
  test('minMint', 'Invalid minimum LP amount', () => {
    enforce(params.minMint).isDecimal().gte(0)
  })
})

// Shared by disconnected previews and form validation. Wallet balances are only needed to submit.
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
  test('amounts', 'Enter non-negative amounts within token precision and the i128 limit', () => {
    enforce(
      amounts?.every((amount, i) => {
        const value = new BigNumber(amount || '0').shiftedBy(decimals?.[i] ?? 0)
        return (
          /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(amount || '0') &&
          ((amount || '0').split('.')[1]?.length ?? 0) <= (decimals?.[i] ?? 0) &&
          value.isInteger() &&
          value.gte(0) &&
          value.lte(MAX_I128.toString())
        )
      }),
    ).isTruthy()
  })
  test('amounts', 'Enter an amount to deposit', () => {
    enforce(amounts?.some(amount => new BigNumber(amount ?? '0').gt(0))).isTruthy()
  })
  test('amounts', 'Seed deposits require a positive amount of every coin', () => {
    enforce(
      supply == null ||
        !new BigNumber(supply).isZero() ||
        decimals?.every((_, i) => new BigNumber(amounts?.[i] || '0').gt(0)),
    ).isTruthy()
  })
  if (maxAmounts)
    test('amounts', 'Insufficient token balance', () => {
      enforce(amounts?.every((amount, i) => new BigNumber(amount || '0').lte(maxAmounts[i]))).isTruthy()
    })
}
const validateForm = (values: DepositFormValues) => {
  validateSlippage(values.slippage)
  validateInputs(values)
  test('maxAmounts', 'Wallet balances are unavailable', () => {
    enforce(values.maxAmounts != null).isTruthy()
  })
}
export const depositFormValidationSuite = createValidationSuite(validateForm)
export const depositSubmissionValidationSuite = createValidationSuite((params: DepositSubmission) => {
  validatePool(params)
  validateAccount(params.account)
  validateForm(params)
  test('quote', 'Deposit must leave LP after the permanent seed lock', () => {
    enforce(new BigNumber(params.quote).gt(0)).isTruthy()
  })
  test('minMint', 'Minimum LP does not match the accepted quote and slippage', () => {
    enforce(minimumMint(params.quote, params.slippage)).equals(params.minMint)
  })
})
export const depositQuoteValidationSuite = createValidationSuite(
  ({ quote, acceptedQuote }: { quote: Decimal; acceptedQuote: Decimal }) => {
    test('quote', 'The quote changed. Review the refreshed LP amount and minimum before depositing.', () => {
      enforce(quote).equals(acceptedQuote)
    })
  },
)
