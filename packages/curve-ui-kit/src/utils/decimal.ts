import { BigNumber } from 'bignumber.js'
import { formatUnits, parseUnits } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'

/** Converts a string to a Decimal typed string, returning undefined for null, undefined, empty strings, or non-finite values. */
export const decimal = (value: number | string | undefined | null | BigNumber | bigint): Decimal | undefined => {
  if (typeof value === 'number' || typeof value === 'bigint') {
    value = value.toString()
  }
  if (value instanceof BigNumber) {
    value = value.toFixed()
  }
  if (value != null && !['', '-', '?', 'Infinity', '-Infinity'].includes(value) && !new BigNumber(value).isNaN()) {
    return value as Decimal
  }
}

/**
 * Returns the minimum Decimal value from an array of Decimals, without losing precision.
 */
export const decimalMin = (...data: Decimal[]): Decimal | undefined =>
  data.reduce<Decimal | undefined>(
    (min, value) => (min == null ? value : new BigNumber(value).isLessThan(min) ? value : min),
    undefined,
  )

/**
 * Returns the maximum Decimal value from an array of Decimals, without losing precision.
 */
export const decimalMax = (...data: Decimal[]): Decimal | undefined =>
  data.reduce<Decimal | undefined>(
    (max, value) => (max == null ? value : new BigNumber(value).isGreaterThan(max) ? value : max),
    undefined,
  )

export const decimalSum = (...data: (Decimal | undefined)[]): Decimal =>
  data.filter((d) => d != null).reduce((sum, value) => new BigNumber(sum).plus(value).toFixed() as Decimal, '0')

export const toWei = (n: string, decimals: number) => decimal(parseUnits(n, decimals))!
export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
