import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { ZERO, decimalCompare, decimalGreaterThan, decimalDiv, decimalMinus, decimalMultiply } from '@ui/lib/decimal'
import { type RangeLocation, priceDistance } from './position-metrics.utils'

/** Provisional prototype cutoffs, not calibrated liquidation probabilities. */
export const PROVISIONAL_POSITION_THRESHOLDS: Record<
  MarketAssetsType,
  { nearRangeDropPercent: Decimal; criticalBufferPercent: Decimal }
> = {
  correlated: { nearRangeDropPercent: '1', criticalBufferPercent: '1' },
  'blue-chip': { nearRangeDropPercent: '5', criticalBufferPercent: '2' },
  'long-tail': { nearRangeDropPercent: '10', criticalBufferPercent: '3' },
}

export type PositionStatusLabel =
  'Liquidatable' | 'Near range' | 'In range' | 'Below range' | 'Above range' | 'Position closed' | 'Status unavailable'

export type PositionSeverity = 'liquidatable' | 'near' | 'inRange' | 'below' | 'neutral'

export type PositionStatus = {
  label: PositionStatusLabel
  severity: PositionSeverity
  location: RangeLocation
  bufferUnavailable: boolean
  liquidationUnsupported: boolean
}

export type PositionStatusInput = {
  oraclePrice?: Decimal
  upperPrice?: Decimal
  lowerPrice?: Decimal
  /** Full Controller health in percentage points. */
  fullHealth: Decimal | undefined
  /** Outstanding debt. Zero means the position is closed. */
  debt?: Decimal
  /** Only strict-negative permits a Liquidatable claim. */
  liquidationPredicate: 'strict-negative' | 'unverified'
  assetsType: MarketAssetsType | undefined
  /** Fixture-only threshold override. Live callers omit this. */
  thresholds?: (typeof PROVISIONAL_POSITION_THRESHOLDS)[MarketAssetsType]
}

export const getRangeHealthFeedback = (health: Decimal | undefined, assetsType: MarketAssetsType | undefined) => {
  if (health == undefined) return undefined
  if (decimalCompare(health, '1') <= 0) return 'Error'
  if (assetsType == undefined) return undefined
  const dropPercent = decimalMultiply(decimalMinus('1', decimalDiv('1', health)), '100')
  return decimalCompare(dropPercent, PROVISIONAL_POSITION_THRESHOLDS[assetsType].nearRangeDropPercent) <= 0
    ? 'Warning'
    : 'Success'
}

export const isCriticalBuffer = (fullHealth: Decimal | undefined, assetsType: MarketAssetsType | undefined) =>
  fullHealth != undefined &&
  decimalCompare(fullHealth, assetsType ? PROVISIONAL_POSITION_THRESHOLDS[assetsType].criticalBufferPercent : ZERO) <= 0

export const resolvePositionStatus = ({
  oraclePrice,
  upperPrice,
  lowerPrice,
  fullHealth,
  debt,
  liquidationPredicate,
  assetsType,
  thresholds: thresholdOverride,
}: PositionStatusInput): PositionStatus => {
  if (debt != undefined && !decimalGreaterThan(debt, ZERO)) {
    return {
      label: 'Position closed',
      severity: 'neutral',
      location: 'unavailable',
      bufferUnavailable: true,
      liquidationUnsupported: false,
    }
  }

  const distance =
    oraclePrice != undefined && upperPrice != undefined && lowerPrice != undefined
      ? priceDistance(oraclePrice, upperPrice, lowerPrice)
      : { location: 'unavailable' as const }
  const location = distance.location
  const supported = liquidationPredicate === 'strict-negative'
  const common = { location, bufferUnavailable: fullHealth == undefined, liquidationUnsupported: !supported }

  if (supported && fullHealth != undefined && decimalCompare(fullHealth, ZERO) < 0) {
    return { ...common, label: 'Liquidatable', severity: 'liquidatable' }
  }
  if (location === 'unavailable') return { ...common, label: 'Status unavailable', severity: 'neutral' }
  if (location === 'inside') return { ...common, label: 'In range', severity: 'inRange' }
  if (location === 'below') return { ...common, label: 'Below range', severity: 'below' }

  const thresholds = thresholdOverride ?? (assetsType ? PROVISIONAL_POSITION_THRESHOLDS[assetsType] : undefined)
  const near =
    supported && thresholds != undefined && decimalCompare(distance.percent, thresholds.nearRangeDropPercent) <= 0
  return near
    ? { ...common, label: 'Near range', severity: 'near' }
    : { ...common, label: 'Above range', severity: 'neutral' }
}
