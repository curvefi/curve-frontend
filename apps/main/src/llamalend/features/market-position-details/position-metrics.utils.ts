import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
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
import { t } from '@ui/lib/i18n'

export type RangeLocation = 'above' | 'inside' | 'below' | 'unavailable'

export type PriceDistance =
  | { location: 'above'; percent: Decimal }
  | { location: 'inside' }
  | { location: 'below'; percent: Decimal }
  | { location: 'unavailable' }

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

const rangeLocation = (
  oraclePrice: Decimal,
  upperPrice: Decimal,
  lowerPrice: Decimal,
): Exclude<RangeLocation, 'unavailable'> => {
  if (decimalGreaterThan(oraclePrice, upperPrice)) return 'above'
  if (decimalCompare(oraclePrice, lowerPrice) < 0) return 'below'
  return 'inside'
}

export const priceDistance = (oraclePrice: Decimal, upperPrice: Decimal, lowerPrice: Decimal): PriceDistance => {
  if (!finitePositive(oraclePrice) || !boundsOk(upperPrice, lowerPrice)) return { location: 'unavailable' }
  const location = rangeLocation(oraclePrice, upperPrice, lowerPrice)
  if (location === 'inside') return { location: 'inside' }
  if (location === 'above') {
    return {
      location,
      percent: decimalMultiply(decimalDiv(decimalMinus(oraclePrice, upperPrice), oraclePrice), d(100)),
    }
  }
  return { location, percent: decimalMultiply(decimalDiv(decimalMinus(lowerPrice, oraclePrice), oraclePrice), d(100)) }
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

/** Labels sum to 100 at 4dp. `collateralExact` stays unrounded for sorting. */
export const compositionShares = (collateralAssets: Decimal, totalAssets: Decimal) => {
  if (!decimalGreaterThan(totalAssets, ZERO)) return undefined
  const collateralExact = decimalMultiply(decimalDiv(collateralAssets, totalAssets), d(100))
  const collateralLabel = BigNumber(collateralExact).decimalPlaces(4, BigNumber.ROUND_HALF_UP)
  const borrowedLabel = BigNumber(100).minus(collateralLabel)
  return { collateralExact, collateralLabel: d(collateralLabel.toFixed(4)), borrowedLabel: d(borrowedLabel.toFixed(4)) }
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

export const formatBufferPercent = (value: Decimal): string => t`${formatSignedPercent(value)} of debt`

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

export const formatPriceDistanceHeadline = (distance: PriceDistance): string => {
  if (distance.location === 'unavailable') return t`Unavailable`
  if (distance.location === 'inside') return t`In range`
  return `${distance.location === 'above' ? '−' : '+'}${formatDistancePercent(distance.percent)}`
}

export const formatPriceDistanceDescription = (distance: PriceDistance): string => {
  if (distance.location === 'above')
    return t`Price drop of ${formatDistancePercent(distance.percent)} to reach the liquidation range`
  if (distance.location === 'below')
    return t`Price rise of ${formatDistancePercent(distance.percent)} to reach the liquidation range`
  if (distance.location === 'inside') return t`In the liquidation range`
  return t`Distance unavailable`
}

export const formatRangeBounds = (
  upper: Parameters<typeof formatNumber>[0],
  lower: Parameters<typeof formatNumber>[0],
) => `${formatNumber(upper, { abbreviate: true })}–${formatNumber(lower, { abbreviate: true })}`

export const formatRangeLabel = (
  upper: Parameters<typeof formatNumber>[0],
  lower: Parameters<typeof formatNumber>[0],
  unit: string,
) => `${formatRangeBounds(upper, lower)} ${unit}`

export const formatShareLabel = (share: Decimal) => BigNumber(share).toFixed(2)

export const inclusiveBandCount = (start: number, end: number) => Math.abs(start - end) + 1

export const formatBandSpan = (start: number, end: number) => `${Math.min(start, end)} to ${Math.max(start, end)}`

/** Tiny and zero amounts keep their signed label. Larger amounts abbreviate. */
export const formatBufferNotional = (amount: Decimal, symbol?: string): string => {
  const magnitude = decimalCompare(amount, ZERO) < 0 ? decimalMinus(ZERO, amount) : amount
  const display =
    decimalEqual(amount, ZERO) || decimalCompare(magnitude, TINY_PERCENT) < 0
      ? formatSignedAmount(amount)
      : formatNumber(amount, { abbreviate: true })
  return symbol ? `${display} ${symbol}` : display
}
