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

/** Best case guess if for some reason we don't know the actual amount of decimals */
export const DEFAULT_DECIMALS = 18
