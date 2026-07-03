import { BigNumber } from 'bignumber.js'
import { formatUnits, parseUnits } from 'viem'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

export const ZERO: Decimal = '0'

/** Converts loose numeric input to an Amount for formatting, returning undefined for empty or non-numeric values. */
export const amount = (value: number | string | BigNumber | bigint | null | undefined): Amount | undefined =>
  value == null || value === '' || Number.isNaN(value) ? undefined : typeof value === 'number' ? value : decimal(value)

/** Converts a string to a Decimal typed string, returning undefined for null, undefined, empty strings, or non-finite values. */
export const decimal = (value: number | string | undefined | null | BigNumber | bigint): Decimal | undefined => {
  if (value != null) {
    const bigNumber = BigNumber(value)
    if (bigNumber.isFinite() && !bigNumber.isNaN()) {
      return bigNumber.toFixed() as Decimal
    }
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

export const decimalCompare = (a: Decimal, b: Decimal) => BigNumber(a).comparedTo(b) ?? 0

/**
 * Returns the maximum Decimal value from an array of Decimals, without losing precision.
 */
export const decimalMax = (...data: Decimal[]) =>
  data.length ? (BigNumber.max(...data).toFixed() as Decimal) : undefined

export const decimalSum = (...data: (Decimal | undefined)[]): Decimal =>
  data.filter(d => d != null).reduce((sum, value) => new BigNumber(sum).plus(value).toFixed() as Decimal, '0')

export const decimalMinus = (first: Decimal, ...rest: (Decimal | undefined)[]): Decimal =>
  rest
    .filter(d => d != null)
    .reduce((acc, value) => acc.minus(value), new BigNumber(first))
    .toFixed() as Decimal

export const decimalNegate = (value: Decimal | undefined) =>
  maybe(value, value => new BigNumber(value).negated().toFixed() as Decimal)

export const decimalEqual = (first: Decimal, second: Decimal) => BigNumber(first).isEqualTo(second)

export const decimalGreaterThan = (first: Decimal, second: Decimal) => BigNumber(first).isGreaterThan(second)

export const decimalMultiply = (first: Decimal, ...items: Amount[]) =>
  items.reduce((p, c) => p.multipliedBy(c), new BigNumber(first)).toFixed() as Decimal

export const decimalSqrt = (value: Decimal): Decimal => {
  const decimalValue = new BigNumber(value)
  if (decimalValue.isNegative()) throw new Error(`Cannot calculate square root of a negative Decimal: ${value}`)
  return decimalValue.squareRoot().toFixed() as Decimal
}

/** Divides the 1st by the 2nd decimal. Does NOT guard for division-by-zero! */
export const decimalDiv = (first: Decimal, second: Decimal) =>
  new BigNumber(first).dividedBy(second).toFixed() as Decimal

export const decimalPercent = (part: Decimal, total: Decimal): Decimal =>
  +total ? decimalMultiply(decimalDiv(part, total), '100') : '0'

export const toWei = (n: string, decimals: number) => decimal(parseUnits(n, decimals))!
export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
