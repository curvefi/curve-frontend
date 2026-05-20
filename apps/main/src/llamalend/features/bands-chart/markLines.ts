import {
  CHART_LINE_DASH_PATTERNS,
  CHART_LINE_WIDTHS,
  type ChartLineDashPattern,
} from '@ui-kit/shared/ui/Chart/chart.utils'
import type { BandsChartPalette, BandsRangeOverlay } from './types'

/**
 * MarkLine data structure for ECharts coord format
 * Each markLine is an array of two coordinate points: [startPoint, endPoint]
 * Includes lineStyle metadata for label styling
 */
export type MarkLine = [{ coord: [number, number] }, { coord: [number, number] }] & {
  lineStyle: { color: string; type: ChartLineDashPattern; width: number }
}

type MarkLineStyle = MarkLine['lineStyle']

const DEFAULT_MARK_LINE_STYLE = {
  type: CHART_LINE_DASH_PATTERNS.regular,
  width: CHART_LINE_WIDTHS.referenceLine,
} satisfies Omit<MarkLineStyle, 'color'>

const DEFAULT_ORACLE_PRICE_LINE_STYLE = {
  type: CHART_LINE_DASH_PATTERNS.tight,
  width: CHART_LINE_WIDTHS.defaultPriceLine,
} satisfies Omit<MarkLineStyle, 'color'>

/**
 * Creates a standardized mark line configuration using coord format
 * for proper alignment with custom series rectangles
 */
const createMarkLine = (
  xStart: number,
  xEnd: number,
  yValue: number,
  color: string,
  style?: Partial<Omit<MarkLineStyle, 'color'>>,
): MarkLine => {
  const line: MarkLine = [{ coord: [xStart, yValue] }, { coord: [xEnd, yValue] }] as MarkLine
  line.lineStyle = { color, ...DEFAULT_MARK_LINE_STYLE, ...style }
  return line
}

const isPriceInsideRange = (price: number, rangeOverlay: BandsRangeOverlay) =>
  price >= rangeOverlay.lowerPrice && price <= rangeOverlay.upperPrice

// When a preview range is shown, it should visually own any overlapping boundary.
// Dropping current lines inside that range avoids lower-priority colors bleeding through
// ECharts markLine dashes at the same or nearby y values.
const createRangeOverlayMarkLines = (
  rangeOverlay: BandsRangeOverlay,
  xStart: number,
  xEnd: number,
  hiddenRanges: BandsRangeOverlay[] = [],
): MarkLine[] => {
  const createVisibleLine = (price: number, color: string) =>
    hiddenRanges.some(hiddenRange => isPriceInsideRange(price, hiddenRange))
      ? null
      : createMarkLine(xStart, xEnd, price, color)

  return [
    createVisibleLine(rangeOverlay.upperPrice, rangeOverlay.topLineColor),
    createVisibleLine(rangeOverlay.lowerPrice, rangeOverlay.bottomLineColor),
  ].filter((line): line is MarkLine => !!line)
}

const createOraclePriceMarkLine = (
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): MarkLine[] => {
  if (!oraclePrice) return []
  const price = Number(oraclePrice)
  if (!Number.isFinite(price)) return []

  return [createMarkLine(xStart, xEnd, price, palette.oraclePriceLineColor, DEFAULT_ORACLE_PRICE_LINE_STYLE)]
}

export const generateRangeMarkLines = (
  rangeOverlay: BandsRangeOverlay,
  xStart: number,
  xEnd: number,
  hiddenRanges?: BandsRangeOverlay[],
): MarkLine[] => createRangeOverlayMarkLines(rangeOverlay, xStart, xEnd, hiddenRanges)

export const generateOracleMarkLines = (
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): MarkLine[] => createOraclePriceMarkLine(oraclePrice, xStart, xEnd, palette)
