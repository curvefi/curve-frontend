import { each, skipWhen, test } from 'vest'
import { isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_POOL_LIMITS as limits } from '@/stellar/features/create-pool/constants'
import type { CreatePoolParams, FactoryImplementationParams } from '@/stellar/features/create-pool/types'
import { maybe, notFalsyArray, type Nullish } from '@primitives/objects.utils'
import {
  createPoolTokenDecimalsField,
  createPoolTokenField,
  getCreatePoolTokens,
} from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { validateAccount, validateNetwork } from './pool.validation'

const encoder = new TextEncoder()
const byteLength = (value: string | Nullish) => maybe(value, value => encoder.encode(value).length)

const validateParameters = ({
  amplification,
  fee,
  feeMultiplier,
  priceOracleAveragingWindow,
  poolName,
  symbol,
}: CreatePoolParams) => {
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
}

const validateForm = (values: FieldsOf<CreatePoolFormValues>) => {
  const { tokenCount, poolType, addLiquidity, maxAmounts } = values
  const tokens = getCreatePoolTokens(values, tokenCount)
  test('tokenCount', `Select between ${limits.tokens.min} and ${limits.tokens.max} different tokens`, () => {
    enforce(tokenCount).gte(limits.tokens.min).lte(limits.tokens.max)
    enforce(new Set(tokens?.map(token => token?.address)).size).equals(tokens?.length)
  })
  each(notFalsyArray(tokens), (token, index) => {
    test(createPoolTokenField(index), 'Select a token', () => {
      enforce(token?.address).isNotEmpty().condition(isContractAddress)
    })
  })
  test('poolType', 'Select a pool type', () => {
    enforce(poolType).isNotEmpty()
  })
  validateParameters(values)
  skipWhen(!addLiquidity, () => {
    each(notFalsyArray(tokens), (token, index) => {
      test(createPoolTokenDecimalsField(index), 'Token decimals are unavailable', () => {
        enforce(token?.decimals).isNumber()
      })
      test(poolAmountField(index), 'Enter a positive amount for every token', () => {
        enforce(values[poolAmountField(index)]).isDecimal().gt(0)
        maybe(token?.decimals, precision =>
          enforce(values[poolAmountField(index)]).isDecimal({ decimal_digits: `0,${precision}` }),
        )
      })
      test(poolAmountField(index), 'Wallet balance is unavailable', () => {
        enforce(maxAmounts?.[index]).isDecimal()
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
  validateParameters(params)
  test('wasmHash', 'Pool creation is currently unavailable for this token count', () => {
    enforce(params.wasmHash).isArray().isNotEmpty()
  })
  test('coins', `Select between ${limits.tokens.min} and ${limits.tokens.max} different tokens`, () => {
    enforce(params.coins?.length).gte(limits.tokens.min).lte(limits.tokens.max)
    enforce(new Set(params.coins).size).equals(params.coins?.length)
    params.coins?.forEach(coin => enforce(coin).isNotEmpty().condition(isContractAddress))
  })
})
