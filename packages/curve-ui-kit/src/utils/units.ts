export type UnitOptions = {
  symbol: string
  position: 'prefix' | 'suffix'
}

const none: UnitOptions = { symbol: '', position: 'suffix' }
const dollar: UnitOptions = { symbol: '$', position: 'prefix' }
const percentage: UnitOptions = { symbol: '%', position: 'suffix' }
const multiplier: UnitOptions = { symbol: 'x', position: 'suffix' }
const UNIT_MAP = { none, dollar, percentage, multiplier } as const

export type Unit = keyof typeof UNIT_MAP | UnitOptions

/**
 * Helper function to get UnitOptions from the more liberal Unit type.
 *
 * Retrieves the corresponding unit value from the UNIT_MAP if the provided unit is a string,
 * otherwise returns the unit itself. Useful for normalizing unit representations.
 *
 * @param unit - The unit to retrieve, which can be either a string key of UNIT_MAP or a Unit object.
 * @returns The resolved unit value from UNIT_MAP if a string is provided, or the original unit if not.
 *
 * @example
 * getUnit('dollar') // { symbol: '$', position: 'prefix' }
 * getUnit('percentage') // { symbol: '%', position: 'suffix' }
 * getUnit({ symbol: 'ETH', position: 'suffix' }) // { symbol: 'ETH', position: 'suffix' }
 * getUnit() // undefined
 */
export const getUnitOptions = (unit?: Unit) => (typeof unit === 'string' ? UNIT_MAP[unit] : unit)

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
 * Example valid values: "123", "45.67", "0.001", "Infinity", "-123.45"
 * Example invalid values: "abc", "12.34.56", "12a34"
 */
export type Decimal = `${number}`

/**
 * Union type used for components that accept both number and Decimal types for amounts.
 */
export type Amount = number | Decimal
