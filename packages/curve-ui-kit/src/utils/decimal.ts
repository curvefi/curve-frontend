import { BigNumber } from 'bignumber.js'

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
