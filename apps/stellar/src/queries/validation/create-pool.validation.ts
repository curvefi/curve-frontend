import { each, skipWhen, test } from 'vest'
import { isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_POOL_LIMITS as limits, STELLAR_POOL_TYPES } from '@/stellar/features/create-pool/constants'
import type { CreatePoolParams, FactoryImplementationParams } from '@/stellar/features/create-pool/types'
import { isComplete } from '@primitives/array.utils'
import { maybe, notFalsyArray, type Nullish } from '@primitives/objects.utils'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { FieldsOf } from '@ui/lib/validation/types'
import { validateAccount, validateNetwork } from './pool.validation'

const encoder = new TextEncoder()
const byteLength = (value: string | Nullish) => maybe(value, value => encoder.encode(value).length)

const validateForm = ({
  tokens,
  poolType,
  amplification,
  fee,
  feeMultiplier,
  priceOracleAveragingWindow,
  poolName,
  symbol,
  addLiquidity,
  decimals,
  maxAmounts,
  slippage,
  ...values
}: FieldsOf<CreatePoolFormValues>) => {
  test('tokens', `Select between ${limits.tokens.min} and ${limits.tokens.max} different tokens`, () => {
    enforce(tokens?.length).gte(limits.tokens.min).lte(limits.tokens.max)
    enforce(tokens?.every(token => token && isContractAddress(token.address))).equals(true)
    enforce(new Set(tokens?.map(token => token?.address)).size).equals(tokens?.length)
  })
  test('poolType', 'Select a pool type', () => {
    enforce(poolType).inside([...STELLAR_POOL_TYPES])
  })
  test(
    'amplification',
    `Amplification must be a whole number between ${limits.amplification.min} and ${limits.amplification.max}`,
    () => {
      enforce(amplification).matches(/^\d+$/)
      enforce(Number(amplification)).gte(limits.amplification.min).lte(limits.amplification.max)
    },
  )
  test(
    'fee',
    `Swap fee must be between ${limits.fee.min}% and ${limits.fee.max}%, with at most ${limits.fee.decimals} decimal places`,
    () => {
      enforce(fee)
        .isDecimal({ decimal_digits: `0,${limits.fee.decimals}` })
        .gte(limits.fee.min)
        .lte(limits.fee.max)
    },
  )
  test(
    'feeMultiplier',
    `The dynamic fee multiplier must be between ${limits.feeMultiplier.min} and ${limits.feeMultiplier.max}, with a maximum fee of ${limits.maxDynamicFee}%`,
    () => {
      enforce(feeMultiplier)
        .isDecimal({ decimal_digits: `0,${limits.feeMultiplier.decimals}` })
        .gte(limits.feeMultiplier.min)
        .lte(limits.feeMultiplier.max)
      enforce(Number(fee) * Number(feeMultiplier)).lte(limits.maxDynamicFee)
    },
  )
  test('priceOracleAveragingWindow', 'Enter a positive whole number of seconds', () => {
    enforce(priceOracleAveragingWindow).matches(/^\d+$/)
    enforce(Number(priceOracleAveragingWindow))
      .gte(limits.priceOracleAveragingWindow.min)
      .lte(limits.priceOracleAveragingWindow.max)
  })
  test('poolName', `Enter a pool name of at most ${limits.nameMaxBytes} bytes`, () => {
    enforce(poolName?.trim()).isNotEmpty()
    enforce(byteLength(poolName)).lte(limits.nameMaxBytes)
  })
  test('symbol', `Enter an LP symbol of at most ${limits.symbolMaxBytes} bytes`, () => {
    enforce(symbol?.trim()).isNotEmpty()
    enforce(byteLength(symbol)).lte(limits.symbolMaxBytes)
  })
  skipWhen(!addLiquidity, () => {
    validateSlippage({ slippage })
    test('decimals', 'Token decimals are unavailable', () => {
      enforce(decimals?.length).equals(tokens?.length)
      enforce(isComplete(decimals)).equals(true)
    })
    each(notFalsyArray(tokens), (_, index) => {
      test(poolAmountField(index), 'Enter a positive amount for every token', () => {
        enforce(values[poolAmountField(index)]).isDecimal().gt(0)
        maybe(decimals?.[index], precision =>
          enforce(values[poolAmountField(index)]).isDecimal({ decimal_digits: `0,${precision}` }),
        )
      })
      maybe(maxAmounts?.[index], balance =>
        test(poolAmountField(index), 'Insufficient token balance', () => {
          enforce(values[poolAmountField(index)]).lte(balance)
        }),
      )
    })
  })
}

export const createPoolFormValidationSuite = createValidationSuite(validateForm)

const validateFactory = ({ network, factory, implementationIndex }: CreatePoolParams) => {
  validateNetwork(network)
  test('factory', 'Pool creation is not configured for this network', () => {
    enforce(factory).isNotEmpty().condition(isContractAddress)
  })
  test('implementationIndex', 'Select a pool implementation', () => {
    enforce(implementationIndex).isNumber().gte(0)
  })
}

export const factoryImplementationValidationSuite = createValidationSuite((params: FactoryImplementationParams) => {
  validateFactory(params)
  test('coins', `Select between ${limits.tokens.min} and ${limits.tokens.max} tokens`, () => {
    enforce(params.coinCount).gte(limits.tokens.min).lte(limits.tokens.max)
  })
})

export const createPoolValidationSuite = createValidationSuite((params: CreatePoolParams) => {
  validateFactory(params)
  validateAccount(params.account)
  validateForm(params)
})
