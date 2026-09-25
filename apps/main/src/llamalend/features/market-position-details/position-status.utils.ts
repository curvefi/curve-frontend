import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { ZERO, decimalCompare, decimalEqual, decimalGreaterThan } from '@ui/lib/decimal'
import { type RangeLocation, priceDistance } from './position-metrics.utils'

/**
 * Arbitrary prototype settings for fixture and layout review.
 * They are not calibrated risk thresholds. Labels, colors, and tooltips read this object.
 * Live transaction validation does not read fixture overrides.
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
  | 'Position closed'
  | 'Status unavailable'

export type PositionSeverity = 'liquidatable' | 'critical' | 'low' | 'converted' | 'protection' | 'near' | 'healthy' | 'neutral'

export type BufferWarning = { label: 'Critical buffer' | 'Low buffer'; severity: 'critical' | 'low' }

export type PositionLead = 'buffer' | 'health' | 'neither'

export type PositionStatus = {
  label: PositionStatusLabel
  severity: PositionSeverity
  lead: PositionLead
  location: RangeLocation
  /** Advisory beside the buffer. It does not replace the main status. */
  bufferWarning?: BufferWarning
  bufferUnavailable: boolean
  /** Predicate cannot support a Liquidatable or Healthy claim. */
  liquidationUnsupported: boolean
}

export type PositionStatusInput = {
  oraclePrice?: Decimal
  upperPrice?: Decimal
  lowerPrice?: Decimal
  /** Full Controller health in percentage points. */
  fullHealth: Decimal | undefined
  collateralQuantity?: Decimal
  /** Outstanding debt. Zero means the position is closed. */
  debt?: Decimal
  /**
   * `strict-negative` means Controller full health < 0 is liquidatable.
   * `unverified` keeps the number visible but does not claim Healthy or Liquidatable.
   */
  liquidationPredicate: 'strict-negative' | 'unverified'
  assetsType: MarketAssetsType | undefined
  /** Fixture-only threshold override. Live callers omit this. */
  thresholds?: (typeof PROVISIONAL_POSITION_THRESHOLDS)[MarketAssetsType]
}

const closed = (): PositionStatus => ({
  label: 'Position closed',
  severity: 'neutral',
  lead: 'neither',
  location: 'unavailable',
  bufferUnavailable: true,
  liquidationUnsupported: false,
})

const factualLabel = (
  location: RangeLocation,
  collateralQuantity: Decimal | undefined,
): Pick<PositionStatus, 'label' | 'severity'> => {
  if (location === 'unavailable') return { label: 'Status unavailable', severity: 'neutral' }
  if (location === 'below' && (collateralQuantity == undefined || !decimalGreaterThan(collateralQuantity, ZERO))) {
    return { label: 'Fully converted', severity: 'converted' }
  }
  if (location === 'below') return { label: 'Partially converted', severity: 'converted' }
  if (location === 'inside') return { label: 'Liquidation Protection', severity: 'protection' }
  return { label: 'Above range', severity: 'neutral' }
}

const aboveDistanceLabel = (
  drop: Decimal | undefined,
  thresholds: PositionStatusInput['thresholds'],
  supported: boolean,
): Pick<PositionStatus, 'label' | 'severity'> => {
  if (!supported || thresholds == undefined || drop == undefined) return { label: 'Above range', severity: 'neutral' }
  if (decimalCompare(drop, thresholds.nearRangeDropPercent) <= 0) return { label: 'Near range', severity: 'near' }
  return { label: 'Healthy', severity: 'healthy' }
}

/** Orthogonal location, main status, leading metric, and optional buffer warning. */
export const resolvePositionStatus = ({
  oraclePrice,
  upperPrice,
  lowerPrice,
  fullHealth,
  collateralQuantity,
  debt,
  liquidationPredicate,
  assetsType,
  thresholds: thresholdOverride,
}: PositionStatusInput): PositionStatus => {
  if (debt != undefined && !decimalGreaterThan(debt, ZERO)) return closed()

  const distance =
    oraclePrice != undefined && upperPrice != undefined && lowerPrice != undefined
      ? priceDistance(oraclePrice, upperPrice, lowerPrice)
      : ({ location: 'unavailable' as const, reason: 'Range or oracle price is missing.' })
  const location = distance.location
  const supported = liquidationPredicate === 'strict-negative'
  const thresholds = thresholdOverride ?? (assetsType ? PROVISIONAL_POSITION_THRESHOLDS[assetsType] : undefined)
  const factual = factualLabel(location, collateralQuantity)
  const drop = distance.location === 'above' ? distance.percent : undefined

  if (fullHealth == undefined) {
    const above = location === 'above' ? { label: 'Above range' as const, severity: 'neutral' as const } : factual
    return {
      location,
      label: location === 'unavailable' ? 'Status unavailable' : above.label,
      severity: location === 'unavailable' ? 'neutral' : above.severity,
      lead: location === 'unavailable' ? 'neither' : 'health',
      bufferUnavailable: true,
      liquidationUnsupported: !supported,
    }
  }

  if (supported && decimalCompare(fullHealth, ZERO) < 0) {
    return {
      location,
      label: 'Liquidatable',
      severity: 'liquidatable',
      lead: 'buffer',
      bufferUnavailable: false,
      liquidationUnsupported: false,
    }
  }

  const exactZero = decimalEqual(fullHealth, ZERO)
  const critical =
    exactZero || (thresholds != undefined && decimalCompare(fullHealth, thresholds.criticalBufferPercent) <= 0)
  const low = thresholds != undefined && decimalCompare(fullHealth, thresholds.lowBufferPercent) <= 0
  const bufferWarning: BufferWarning | undefined = critical
    ? { label: 'Critical buffer', severity: 'critical' }
    : low
      ? { label: 'Low buffer', severity: 'low' }
      : undefined

  if (exactZero || (!supported && decimalCompare(fullHealth, ZERO) < 0)) {
    return {
      location,
      label: exactZero ? 'Critical buffer' : factual.label,
      severity: exactZero ? 'critical' : factual.severity,
      lead: 'buffer',
      bufferWarning: exactZero ? { label: 'Critical buffer', severity: 'critical' } : undefined,
      bufferUnavailable: false,
      liquidationUnsupported: !supported,
    }
  }

  if (location === 'above') {
    const main = aboveDistanceLabel(drop, thresholds, supported)
    return {
      location,
      ...main,
      lead: 'health',
      bufferWarning,
      bufferUnavailable: false,
      liquidationUnsupported: !supported,
    }
  }

  if (location === 'inside' || location === 'below') {
    if (critical) {
      return {
        location,
        label: 'Critical buffer',
        severity: 'critical',
        lead: 'buffer',
        bufferUnavailable: false,
        liquidationUnsupported: !supported,
      }
    }
    if (low) {
      return {
        location,
        label: 'Low buffer',
        severity: 'low',
        lead: 'buffer',
        bufferUnavailable: false,
        liquidationUnsupported: !supported,
      }
    }
    return {
      location,
      ...factual,
      lead: 'buffer',
      bufferUnavailable: false,
      liquidationUnsupported: !supported,
    }
  }

  return {
    location: 'unavailable',
    label: 'Status unavailable',
    severity: 'neutral',
    lead: 'health',
    bufferWarning,
    bufferUnavailable: false,
    liquidationUnsupported: !supported,
  }
}
