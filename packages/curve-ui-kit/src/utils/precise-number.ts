import { BigNumber } from 'bignumber.js'

/**
 * A type representing a number with high precision, stored as a string to avoid floating-point inaccuracies.
 * The number is immutable and should not be modified directly.
 * This type is useful for financial calculations or any scenario where precision is critical.
 * We avoid using bigint to keep compatibility with JSON and other serialization formats.
 * We avoid using string directly as that causes confusion whether the value is formattted or not.
 */
export type PreciseNumber = { readonly number: string }

export const toPrecise = <T extends number | string | BigNumber | null | undefined>(value: T) =>
  (value === null || value === undefined ? undefined : { number: value.toString() }) as T extends null | undefined
    ? undefined
    : PreciseNumber

export const fromPrecise = <T extends PreciseNumber | number | null | undefined>(value: T) =>
  (typeof value === 'number' ? value : value == null ? undefined : +value.number) as T extends PreciseNumber | number
    ? number
    : undefined

export const stringNumber = (value: PreciseNumber | null | undefined): string => value?.number ?? ''
export const Zero = { number: '0' }

export const multiplyPrecise = (
  ...numbers: (PreciseNumber | string | number | undefined | null)[]
): PreciseNumber | undefined => {
  const values = filter(numbers)
  return values.length === 0
    ? undefined
    : { number: values.reduce((acc, n) => acc.times(n), new BigNumber(1)).toString() }
}

export const dividePrecise = (numerator: PreciseNumber, denominator: PreciseNumber): PreciseNumber | undefined => ({
  number: new BigNumber(stringNumber(numerator)).dividedBy(new BigNumber(stringNumber(denominator))).toString(),
})

const filter = (numbers: (PreciseNumber | string | number | undefined | null)[]) =>
  numbers
    .filter((n) => n != null)
    .map((n) => new BigNumber(typeof n === 'object' ? stringNumber(n) : n))
    .filter((n) => !n.isNaN())

export const minPrecise = (...numbers: (PreciseNumber | undefined | null)[]): PreciseNumber | undefined => {
  const values = filter(numbers)
  return values.length === 0 ? undefined : { number: BigNumber.minimum(...values).toString() }
}

/**
 * Converts a string to a number, returning undefined for null, undefined, empty strings, or non-finite values.
 */
export const stringToPrecise = (value: string | undefined | null): PreciseNumber | undefined =>
  ['', null, undefined, '-', '?', 'NaN'].includes(value) ? undefined : { number: value! }

export const sumPrecise = (
  ...numbers: (PreciseNumber | string | number | undefined | null)[]
): PreciseNumber | undefined => {
  const values = filter(numbers)
  return values.length === 0
    ? undefined
    : { number: values.reduce((acc, n) => acc.plus(n), new BigNumber(0)).toString() }
}

export const negate = <T extends PreciseNumber | undefined | null>(value: T) =>
  (value == null
    ? undefined
    : { number: new BigNumber(stringNumber(value)).negated().toString() }) as T extends PreciseNumber
    ? PreciseNumber
    : undefined
