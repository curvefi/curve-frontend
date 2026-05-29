import {
  DEFAULT_SMALL_LIQUIDATION_RANGE_CHART_DOMAIN,
  ORACLE_MARKER_LAYOUT,
  SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS,
} from './small-liquidation-range-chart.constants'
import type {
  ChartDomain,
  ChartTextStyle,
  OracleRailLayout,
  RenderableLiquidationRange,
  SmallLiquidationRangeChartLayout,
  SplitMode,
} from './small-liquidation-range-chart.types'

const DEFAULT_PADDING_RATIO = 0.1
const DEFAULT_PADDED_MIN_RATIO = 1 - DEFAULT_PADDING_RATIO
// Keep nearby oracle prices on a normal scale; split only once the oracle is more than
// two liquidation-range widths away. Below that threshold, the real-price scale is readable.
const SPLIT_ORACLE_DISTANCE_RATIO = 2

interface GetChartLayoutParams {
  currentRange?: RenderableLiquidationRange
  newRange?: RenderableLiquidationRange
  oraclePrice?: number
}

export const toEChartsPixelValue = (value: number | string, htmlFontSize: number) => {
  if (typeof value === 'number') return value

  const numericValue = Number.parseFloat(value)
  return value.endsWith('rem') ? numericValue * htmlFontSize : numericValue
}

const estimateTextWidth = (text: string, textStyle: ChartTextStyle) =>
  text.length * textStyle.fontSize * ORACLE_MARKER_LAYOUT.label.estimatedCharacterWidthRatio

export const getOracleMarkerLabelWidth = ({
  htmlFontSize,
  text,
  textStyle,
}: {
  htmlFontSize: number
  text: string
  textStyle: ChartTextStyle
}) =>
  estimateTextWidth(text, textStyle) +
  toEChartsPixelValue(ORACLE_MARKER_LAYOUT.label.horizontalPadding, htmlFontSize) * 2

const getExtent = (values: number[]): ChartDomain => [Math.min(...values), Math.max(...values)]

const padDomain = ([domainMin, domainMax]: ChartDomain): ChartDomain => {
  if (domainMin === domainMax) {
    const halfWidth = domainMin === 0 ? 1 : Math.abs(domainMin) * DEFAULT_PADDING_RATIO
    return [domainMin - halfWidth, domainMax + halfWidth]
  }

  const padding = (domainMax - domainMin) * DEFAULT_PADDING_RATIO
  const rawPaddedMin = domainMin - padding
  const paddedMax = domainMax + padding
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

// Maps the real oracle value to the synthetic rail. The rail preserves direction and
// relative position between "..." and a nice rounded terminal tick, without letting a
// far oracle value flatten the liquidation range on the main price axis.
const getOracleRail = ({ mode, oraclePrice }: { mode: SplitMode; oraclePrice: number }): OracleRailLayout => {
  const step = getNiceTerminalStep(oraclePrice)
  const { min, breakTick, max } = SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS

  if (mode === 'split-left') {
    const terminalTick = Math.floor(oraclePrice / step) * step
    // Keep the terminal tick outside the oracle marker so the label does not sit on top of the tick.
    const adjustedTerminalTick = terminalTick >= oraclePrice ? terminalTick - step : terminalTick
    const visibleEnd = adjustedTerminalTick + (oraclePrice >= adjustedTerminalTick + step ? step * 2 : step)

    return {
      terminalTick: adjustedTerminalTick,
      markerPosition:
        min + ((oraclePrice - adjustedTerminalTick) / (visibleEnd - adjustedTerminalTick)) * (breakTick - min),
    }
  }

  const terminalTick = Math.ceil(oraclePrice / step) * step
  // Same terminal-tick separation as split-left, mirrored for high oracle prices.
  const adjustedTerminalTick = terminalTick <= oraclePrice ? terminalTick + step : terminalTick
  const visibleStart = adjustedTerminalTick - (oraclePrice <= adjustedTerminalTick - step ? step * 2 : step)

  return {
    terminalTick: adjustedTerminalTick,
    markerPosition:
      breakTick + ((oraclePrice - visibleStart) / (adjustedTerminalTick - visibleStart)) * (max - breakTick),
  }
}

/** Chooses between a real continuous scale and the compact split rail for distant oracle prices. */
export const getSmallLiquidationRangeChartLayout = ({
  currentRange,
  newRange,
  oraclePrice,
}: GetChartLayoutParams): SmallLiquidationRangeChartLayout | undefined => {
  const rangeValues = [...(currentRange ?? []), ...(newRange ?? [])]
  const rangeDomain = rangeValues.length === 0 ? undefined : getExtent(rangeValues)
  const splitMode = getSplitMode({ oraclePrice, rangeDomain })

  if (splitMode && rangeDomain && oraclePrice !== undefined) {
    // In split mode, the main chart must be based only on the liquidation range.
    // Including the oracle here would recreate the compressed, unreadable range.
    return {
      mode: splitMode,
      mainDomain: padDomain(rangeDomain),
      oracleRail: getOracleRail({ mode: splitMode, oraclePrice }),
    }
  }

  const continuousValues = [...rangeValues, ...(oraclePrice === undefined ? [] : [oraclePrice])]

  // Continuous mode uses one real price axis. This is the preferred path unless the oracle
  // is far enough away to damage readability.
  return {
    mode: 'continuous',
    mainDomain:
      continuousValues.length === 0
        ? DEFAULT_SMALL_LIQUIDATION_RANGE_CHART_DOMAIN
        : padDomain(getExtent(continuousValues)),
  }
}
