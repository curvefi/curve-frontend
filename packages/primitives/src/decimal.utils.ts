import { assert } from './objects.utils'

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

/** Matches the viem formatUnits function, without the dependency */
const formatUnits = (value: bigint, decimals: number): Decimal => {
  assert(Number.isInteger(decimals) && decimals >= 0, 'Decimals must be a non-negative integer')
  const negative = value < 0n
  const digits = (negative ? -value : value).toString().padStart(decimals + 1, '0')
  const integer = decimals ? digits.slice(0, -decimals) : digits
  const fraction = decimals ? digits.slice(-decimals).replace(/0+$/, '') : ''
  return `${negative ? '-' : ''}${integer}${fraction ? `.${fraction}` : ''}` as Decimal
}

/** Matches the viem formatUnits function, without the dependency */
const parseUnits = (value: Decimal, decimals: number) => {
  assert(Number.isInteger(decimals) && decimals >= 0, 'Decimals must be a non-negative integer')
  assert(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value), `Invalid decimal value: ${value}`)
  const negative = value.startsWith('-')
  const [integer = '0', fraction = ''] = (negative ? value.slice(1) : value).split('.')
  const scale = 10n ** BigInt(decimals)
  const unitFraction = fraction.slice(0, decimals).padEnd(decimals, '0')
  const add = fraction.length > decimals && fraction[decimals] >= '5' ? 1n : 0n
  return (negative ? -1n : 1n) * (BigInt(integer || '0') * scale + BigInt(unitFraction || '0') + add)
}

export const toWei = (n: Decimal, decimals: number): Decimal => parseUnits(n, decimals).toString() as Decimal

export const fromWei = (n: Decimal, decimals: number): Decimal => formatUnits(BigInt(n), decimals)
