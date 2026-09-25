import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import {
  ZERO,
  decimal,
  decimalCompare,
  decimalDiv,
  decimalEqual,
  decimalGreaterThan,
  decimalMinus,
  decimalMultiply,
} from '@ui/lib/decimal'

export type RangeLocation = 'above' | 'inside' | 'below' | 'unavailable'

export type PriceDistance =
  | { location: 'above'; percent: Decimal; label: 'price drop to range' }
  | { location: 'inside'; label: 'In range' }
  | { location: 'below'; percent: Decimal; label: 'price rise to range' }
  | { location: 'unavailable'; reason: string }

const requireDecimal = (value: Decimal | undefined, label: string): Decimal => {
  if (value == undefined) throw new Error(`Expected a decimal ${label}`)
  return value
}

const d = (value: number | string) => requireDecimal(decimal(value), String(value))

const finitePositive = (value: Decimal) => {
  const parsed = BigNumber(value)
  return parsed.isFinite() && parsed.gt(0)
}

const boundsOk = (upperPrice: Decimal, lowerPrice: Decimal) => {
  const upper = BigNumber(upperPrice)
  const lower = BigNumber(lowerPrice)
  return upper.isFinite() && lower.isFinite() && upper.gt(0) && lower.gt(0) && upper.gte(lower)
}

/** Oracle-price health: max(oracle / top of range, 1). Invalid prices are unavailable, not 1. */
export const oracleHealth = (oraclePrice: Decimal, upperPrice: Decimal): Decimal | undefined => {
  if (!finitePositive(oraclePrice) || !finitePositive(upperPrice)) return undefined
  const ratio = decimalDiv(oraclePrice, upperPrice)
  return decimalGreaterThan(ratio, d(1)) ? ratio : d(1)
}

export const rangeLocation = (oraclePrice: Decimal, upperPrice: Decimal, lowerPrice: Decimal): RangeLocation => {
  if (decimalGreaterThan(oraclePrice, upperPrice)) return 'above'
  if (decimalCompare(oraclePrice, lowerPrice) < 0) return 'below'
  return 'inside'
}

export const priceDistance = (oraclePrice: Decimal, upperPrice: Decimal, lowerPrice: Decimal): PriceDistance => {
  if (!finitePositive(oraclePrice) || !boundsOk(upperPrice, lowerPrice)) {
    return { location: 'unavailable', reason: 'Oracle price or range bounds are not usable.' }
  }
  const location = rangeLocation(oraclePrice, upperPrice, lowerPrice)
  if (location === 'inside') return { location: 'inside', label: 'In range' }
  if (location === 'above') {
    return {
      location,
      percent: decimalMultiply(decimalDiv(decimalMinus(oraclePrice, upperPrice), oraclePrice), d(100)),
      label: 'price drop to range',
    }
  }
  return {
    location,
    percent: decimalMultiply(decimalDiv(decimalMinus(lowerPrice, oraclePrice), oraclePrice), d(100)),
    label: 'price rise to range',
  }
}

/** Full Controller health is already percentage points. Amount is debt times that percent. */
export const bufferAmount = (debt: Decimal, healthPercentagePoints: Decimal): Decimal =>
  decimalDiv(decimalMultiply(debt, healthPercentagePoints), d(100))

export const collateralTokenValue = (quantity: Decimal, oraclePrice: Decimal): Decimal =>
  decimalMultiply(quantity, oraclePrice)

export const collateralValue = (quantity: Decimal, oraclePrice: Decimal, borrowedQuantity: Decimal): Decimal =>
  d(BigNumber(collateralTokenValue(quantity, oraclePrice)).plus(borrowedQuantity).toFixed())

export const equity = (assets: Decimal, debt: Decimal): Decimal => decimalMinus(assets, debt)

/** Remaining collateral value over equity. Undefined when equity is not positive. */
export const leverage = (collateralValueAmount: Decimal, equityAmount: Decimal): Decimal | undefined =>
  decimalGreaterThan(equityAmount, ZERO) ? decimalDiv(collateralValueAmount, equityAmount) : undefined

/** Card leverage: collateral token value divided by equity. Not the SDK deposit multiple. */
export const equityLeverage = (
  collateralQuantity: Decimal,
  oraclePrice: Decimal,
  stablecoin: Decimal,
  debt: Decimal,
): Decimal | undefined => {
  const tokenValue = collateralTokenValue(collateralQuantity, oraclePrice)
  const assets = collateralValue(collateralQuantity, oraclePrice, stablecoin)
  return leverage(tokenValue, equity(assets, debt))
}

/**
 * Current-value shares that sum to 100 at the displayed precision.
 * Underlying ratios stay exact on the returned `exact` fields.
 */
export const compositionShares = (collateralAssets: Decimal, borrowedAssets: Decimal, totalAssets: Decimal) => {
  if (!decimalGreaterThan(totalAssets, ZERO)) return undefined
  const collateralExact = decimalMultiply(decimalDiv(collateralAssets, totalAssets), d(100))
  const borrowedExact = decimalMultiply(decimalDiv(borrowedAssets, totalAssets), d(100))
  const collateralLabel = BigNumber(collateralExact).decimalPlaces(4, BigNumber.ROUND_HALF_UP)
  const borrowedLabel = BigNumber(100).minus(collateralLabel)
  return {
    collateralExact,
    borrowedExact,
    collateralLabel: d(collateralLabel.toFixed(4)),
    borrowedLabel: d(borrowedLabel.toFixed(4)),
  }
}

/** Any value above 1 must not collapse to the boundary label 1.00. */
export const formatOracleHealth = (health: Decimal): string => {
  if (!decimalGreaterThan(health, d(1))) return '1.00'
  const two = BigNumber(health).toFixed(2)
  if (!BigNumber(two).isEqualTo(1)) return two
  for (let places = 3; places <= 8; places += 1) {
    const text = BigNumber(health).toFixed(places)
    if (!BigNumber(text).isEqualTo(1)) return text.replace(/0+$/, '')
  }
  return '>1.00'
}

const TINY_PERCENT = d('0.01')

/** Sign-preserving percent. Exact zero stays 0.00%. Nonzero values inside 0.01% stay visibly off zero. */
export const formatSignedPercent = (value: Decimal): string => {
  if (decimalEqual(value, ZERO)) return '0.00%'
  const negative = decimalCompare(value, ZERO) < 0
  const magnitude = negative ? decimalMinus(ZERO, value) : value
  if (decimalCompare(magnitude, TINY_PERCENT) < 0) return negative ? '−<0.01%' : '<0.01%'
  const text = BigNumber(value).toFixed(2)
  return `${text}%`
}

export const formatSignedAmount = (value: Decimal): string => {
  if (decimalEqual(value, ZERO)) return '0.00'
  const negative = decimalCompare(value, ZERO) < 0
  const magnitude = negative ? decimalMinus(ZERO, value) : value
  if (decimalCompare(magnitude, TINY_PERCENT) < 0) return negative ? '−<0.01' : '<0.01'
  return BigNumber(value).toFixed(2)
}

/** Nonzero distances inside 0.01% must not look like an exact boundary. */
export const formatDistancePercent = (percent: Decimal): string => {
  if (decimalEqual(percent, ZERO)) return '0.00%'
  if (decimalCompare(percent, TINY_PERCENT) < 0) return '<0.01%'
  return `${BigNumber(percent).toFixed(4)}%`
}
