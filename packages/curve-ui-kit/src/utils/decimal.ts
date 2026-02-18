import { BigNumber } from 'bignumber.js'
import { DEFAULT_DECIMALS } from './units'

/**
 * A template literal type representing a decimal number as a string.
 * This type ensures that the string consists of numeric characters, optionally including a decimal point.
 *
 * We should avoid using `number` type directly for decimals in contexts where precision is crucial,
 * such as financial calculations, to prevent issues with floating-point arithmetic.
 *
 * We also want to avoid using `string` directly to ensure that the value is a valid decimal representation.
 * Finally, `bigint` is not serializable to JSON and does not support decimal points, making it unsuitable for this purpose.
 *
 * Example valid values: "123", "45.67", "0.001", "Infinity", "-1.45e18"
 * Example invalid values: "abc", "12.34.56", "12a34"
 */
export type Decimal = `${number}`

/**
 * Union type used for components that accept both number and Decimal types for amounts.
 */
export type Amount = number | Decimal

/** Converts a string to a Decimal typed string, returning undefined for null, undefined, empty strings, or non-finite values. */
export const decimal = (value: number | string | undefined | null | BigNumber): Decimal | undefined => {
  if (typeof value === 'number' || value instanceof BigNumber) {
    value = value.toString()
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

export const toWei = (n: string, decimals = DEFAULT_DECIMALS) => decimal(BigNumber(n).times(10 ** decimals))!
export const fromWei = (n: string, decimals = DEFAULT_DECIMALS) => decimal(BigNumber(n).dividedBy(10 ** decimals))!
