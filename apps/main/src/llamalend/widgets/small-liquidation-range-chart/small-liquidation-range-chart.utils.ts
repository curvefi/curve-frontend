type RenderableLiquidationRange = readonly [number, number]
type ChartDomain = readonly [number, number]
type SplitMode = 'split-left' | 'split-right'
type OracleRailLayout = {
  // Synthetic x-value on the rail axis where the oracle marker is rendered.
  markerPosition: number
  // Rounded price label shown at the far end of the truncated rail.
  terminalTick: number
}

const DEFAULT_PADDING_RATIO = 0.1
const DEFAULT_PADDED_MIN_RATIO = 1 - DEFAULT_PADDING_RATIO
// Keep nearby oracle prices on a normal scale; split only once the oracle is more than two range widths away.
const SPLIT_ORACLE_DISTANCE_RATIO = 2

// Split mode uses a small synthetic rail axis instead of plotting the real oracle value on the main price scale.
// These are rail coordinates, not prices: edge of chart, "..." break, and rounded outer tick.
export const SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS = {
  min: 0,
  breakTick: 1,
  max: 2,
} as const

type GetChartDomainParams = {
  currentRange?: RenderableLiquidationRange
  newRange?: RenderableLiquidationRange
  oraclePrice?: number
}

export type SmallLiquidationRangeChartLayout =
  | {
      mode: 'continuous'
      mainDomain: ChartDomain
    }
  | {
      mode: SplitMode
      mainDomain: ChartDomain
      oracleRail: OracleRailLayout
    }

const getExtent = (values: number[]): ChartDomain => [Math.min(...values), Math.max(...values)]

const padDomain = ([domainMin, domainMax]: ChartDomain): ChartDomain => {
  if (domainMin === domainMax) {
    const halfWidth = domainMin === 0 ? 1 : Math.abs(domainMin) * DEFAULT_PADDING_RATIO
    return [domainMin - halfWidth, domainMax + halfWidth]
  }

  const padding = (domainMax - domainMin) * DEFAULT_PADDING_RATIO
  const rawPaddedMin = domainMin - padding
  const paddedMax = domainMax + padding
  // Prices are positive, so avoid wasting chart width by padding down to zero.
  const paddedMin = domainMin <= padding ? domainMin * DEFAULT_PADDED_MIN_RATIO : rawPaddedMin

  return [paddedMin, paddedMax]
}

const getSplitMode = ({
  oraclePrice,
  rangeDomain,
}: {
  oraclePrice?: number
  rangeDomain?: ChartDomain
}): SplitMode | undefined => {
  if (oraclePrice === undefined || !rangeDomain) return undefined

  const [rangeMin, rangeMax] = rangeDomain
  const span = rangeMax - rangeMin
  if (span <= 0) return undefined

  if (oraclePrice < rangeMin && rangeMin - oraclePrice > span * SPLIT_ORACLE_DISTANCE_RATIO) return 'split-left'
  if (oraclePrice > rangeMax && oraclePrice - rangeMax > span * SPLIT_ORACLE_DISTANCE_RATIO) return 'split-right'

  return undefined
}

const getNiceTerminalStep = (value: number) => {
  const absoluteValue = Math.abs(value)
  return absoluteValue === 0 ? 1 : 10 ** Math.floor(Math.log10(absoluteValue))
}

// Maps the real oracle value to the synthetic rail. The rail is intentionally schematic: it preserves which side the
// oracle is on and where it sits between the break marker and the rounded terminal tick.
const getOracleRail = ({ mode, oraclePrice }: { mode: SplitMode; oraclePrice: number }): OracleRailLayout => {
  const step = getNiceTerminalStep(oraclePrice)
  const { min, breakTick, max } = SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS

  // The terminal tick must move past the oracle instead of duplicating it. The notional span can widen by one step
  // when the oracle sits exactly on a rounded tick, keeping the marker away from the terminal label.
  if (mode === 'split-left') {
    const terminalTick = Math.floor(oraclePrice / step) * step
    const adjustedTerminalTick = terminalTick >= oraclePrice ? terminalTick - step : terminalTick
    const visibleEnd = adjustedTerminalTick + (oraclePrice >= adjustedTerminalTick + step ? step * 2 : step)

    return {
      terminalTick: adjustedTerminalTick,
      markerPosition:
        min + ((oraclePrice - adjustedTerminalTick) / (visibleEnd - adjustedTerminalTick)) * (breakTick - min),
    }
  }

  const terminalTick = Math.ceil(oraclePrice / step) * step
  const adjustedTerminalTick = terminalTick <= oraclePrice ? terminalTick + step : terminalTick
  const visibleStart = adjustedTerminalTick - (oraclePrice <= adjustedTerminalTick - step ? step * 2 : step)

  return {
    terminalTick: adjustedTerminalTick,
    markerPosition:
      breakTick + ((oraclePrice - visibleStart) / (adjustedTerminalTick - visibleStart)) * (max - breakTick),
  }
}

/** Chooses between the normal axis and a compact split layout for distant oracle prices. */
export const getSmallLiquidationRangeChartLayout = ({
  currentRange,
  newRange,
  oraclePrice,
}: GetChartDomainParams): SmallLiquidationRangeChartLayout | undefined => {
  const rangeValues = [...(currentRange ?? []), ...(newRange ?? [])]
  const rangeDomain = rangeValues.length === 0 ? undefined : getExtent(rangeValues)
  const splitMode = getSplitMode({ oraclePrice, rangeDomain })

  if (splitMode && rangeDomain && oraclePrice !== undefined) {
    // In split mode the main domain is based only on the visible liquidation ranges; the oracle gets a rail.
    return {
      mode: splitMode,
      mainDomain: padDomain(rangeDomain),
      oracleRail: getOracleRail({ mode: splitMode, oraclePrice }),
    }
  }

  const continuousValues = [...rangeValues, ...(oraclePrice === undefined ? [] : [oraclePrice])]

  // In continuous mode the oracle remains part of the real price domain.
  return continuousValues.length === 0
    ? undefined
    : {
        mode: 'continuous',
        mainDomain: padDomain(getExtent(continuousValues)),
      }
}
