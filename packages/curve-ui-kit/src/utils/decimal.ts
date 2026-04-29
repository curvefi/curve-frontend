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
export const decimalMax = (...data: Decimal[]) =>
  data.length ? (BigNumber.max(...data)!.toFixed() as Decimal) : undefined

export const decimalSum = (...data: (Decimal | undefined)[]): Decimal =>
  data.filter(d => d != null).reduce((sum, value) => new BigNumber(sum).plus(value).toFixed() as Decimal, '0')

export const decimalMinus = (first: Decimal, ...rest: (Decimal | undefined)[]): Decimal =>
  rest
    .filter(d => d != null)
    .reduce((acc, value) => acc.minus(value), new BigNumber(first))
    .toFixed() as Decimal

export const decimalNegate = (value: Decimal | undefined) =>
  value != null ? (new BigNumber(value).negated().toFixed() as Decimal) : undefined

export const decimalEqual = (first: Decimal, second: Decimal) => BigNumber(first).isEqualTo(second)

export const decimalGreaterThan = (first: Decimal, second: Decimal) => BigNumber(first).isGreaterThan(second)

/** Divides the 1st by the 2nd decimal. Does NOT guard for division-by-zero! */
export const decimalDiv = (first: Decimal, second: Decimal) =>
  new BigNumber(first).dividedBy(second).toFixed() as Decimal

export const decimalAbs = (value: Decimal) => new BigNumber(value).abs().toFixed() as Decimal

export const toWei = (n: string, decimals: number) => decimal(parseUnits(n, decimals))!
export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
