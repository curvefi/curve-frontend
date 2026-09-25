import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { ZERO, decimalCompare, decimalEqual, decimalGreaterThan } from '@ui/lib/decimal'
import { type RangeLocation, priceDistance } from './position-metrics.utils'

/**
 * Arbitrary prototype settings for fixture and layout review.
 * They are not calibrated risk thresholds. Edit them here; labels and colors both read this object.
 */
export const PROVISIONAL_POSITION_THRESHOLDS: Record<
  MarketAssetsType,
  { nearRangeDropPercent: Decimal; lowBufferPercent: Decimal; criticalBufferPercent: Decimal }
> = {
  correlated: { nearRangeDropPercent: '8', lowBufferPercent: '6', criticalBufferPercent: '2' },
  'blue-chip': { nearRangeDropPercent: '12', lowBufferPercent: '8', criticalBufferPercent: '3' },
  'long-tail': { nearRangeDropPercent: '18', lowBufferPercent: '10', criticalBufferPercent: '4' },
}

export type PositionStatusLabel =
  | 'Liquidatable'
  | 'Critical buffer'
  | 'Low buffer'
  | 'Fully converted'
  | 'Partially converted'
  | 'Liquidation Protection'
  | 'Near range'
  | 'Healthy'
  | 'Above range'
  | 'Unknown safety'

export type PositionSeverity = 'liquidatable' | 'critical' | 'low' | 'converted' | 'protection' | 'near' | 'healthy' | 'neutral'

export type PositionStatus = {
  label: PositionStatusLabel
  severity: PositionSeverity
  lead: 'buffer' | 'health'
  /** Factual location stays available when a warning replaces the label. */
  location: RangeLocation
}

export type PositionStatusInput = {
  oraclePrice: Decimal
  upperPrice: Decimal
  lowerPrice: Decimal
  /** Full Controller health in percentage points. */
  fullHealth: Decimal | undefined
  collateralQuantity: Decimal
  /**
   * `strict-negative` means Controller full health < 0.
   * Callers pass this for the live health read. It is not a deployment-matched certificate.
   */
  liquidationPredicate: 'strict-negative' | 'unverified'
  assetsType: MarketAssetsType | undefined
}

const locationLabel = (location: RangeLocation, collateralQuantity: Decimal): Pick<PositionStatus, 'label' | 'severity' | 'lead'> => {
  if (location === 'unavailable') return { label: 'Unknown safety', severity: 'neutral', lead: 'health' }
  if (location === 'below' && !decimalGreaterThan(collateralQuantity, ZERO)) {
    return { label: 'Fully converted', severity: 'converted', lead: 'health' }
  }
  if (location === 'below') return { label: 'Partially converted', severity: 'converted', lead: 'health' }
  if (location === 'inside') return { label: 'Liquidation Protection', severity: 'protection', lead: 'buffer' }
  return { label: 'Above range', severity: 'neutral', lead: 'health' }
}

export const resolvePositionStatus = ({
  oraclePrice,
  upperPrice,
  lowerPrice,
  fullHealth,
  collateralQuantity,
  assetsType,
}: PositionStatusInput): PositionStatus => {
  const distance = priceDistance(oraclePrice, upperPrice, lowerPrice)
  if (distance.location === 'unavailable') {
    return { location: 'unavailable', label: 'Unknown safety', severity: 'neutral', lead: 'health' }
  }
  const location = distance.location
  const factual = locationLabel(location, collateralQuantity)
  if (fullHealth == undefined) {
    return {
      location,
      ...factual,
      label: location === 'above' ? 'Unknown safety' : factual.label,
      severity: 'neutral',
      lead: factual.lead,
    }
  }

  const liquidatable = decimalCompare(fullHealth, ZERO) < 0
  if (liquidatable) return { location, label: 'Liquidatable', severity: 'liquidatable', lead: location === 'inside' ? 'buffer' : 'health' }

  const exactZero = decimalEqual(fullHealth, ZERO)
  const thresholds = assetsType ? PROVISIONAL_POSITION_THRESHOLDS[assetsType] : undefined
  const critical =
    exactZero ||
    (thresholds != undefined && decimalCompare(fullHealth, thresholds.criticalBufferPercent) <= 0)
  if (critical) return { location, label: 'Critical buffer', severity: 'critical', lead: location === 'inside' ? 'buffer' : 'health' }

  if (thresholds != undefined && decimalCompare(fullHealth, thresholds.lowBufferPercent) <= 0) {
    return { location, label: 'Low buffer', severity: 'low', lead: location === 'inside' ? 'buffer' : 'health' }
  }

  if (location !== 'above') return { location, ...factual }

  if (thresholds == undefined) return { location, label: 'Above range', severity: 'neutral', lead: 'health' }

  const drop = distance.location === 'above' ? distance.percent : undefined
  if (drop != undefined && decimalCompare(drop, thresholds.nearRangeDropPercent) <= 0) {
    return { location, label: 'Near range', severity: 'near', lead: 'health' }
  }
  return { location, label: 'Healthy', severity: 'healthy', lead: 'health' }
}
