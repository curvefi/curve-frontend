import {
  CHART_LINE_DASH_PATTERNS,
  CHART_LINE_WIDTHS,
  type ChartLineDashPattern,
} from '@ui-kit/shared/ui/Chart/chart.utils'
import type { BandsChartPalette, BandsRangeOverlay } from './types'

/**
 * Internal horizontal-line data shared by custom range-boundary series and
 * native ECharts oracle markLine conversion.
 */
export type HorizontalLine = {
  startPoint: { coord: [number, number] }
  endPoint: { coord: [number, number] }
  lineStyle: { color: string; type: ChartLineDashPattern; width: number }
}

type HorizontalLineStyle = HorizontalLine['lineStyle']

const DEFAULT_HORIZONTAL_LINE_STYLE = {
  type: CHART_LINE_DASH_PATTERNS.regular,
  width: CHART_LINE_WIDTHS.referenceLine,
} satisfies Omit<HorizontalLineStyle, 'color'>

const DEFAULT_ORACLE_PRICE_LINE_STYLE = {
  type: CHART_LINE_DASH_PATTERNS.tight,
  width: CHART_LINE_WIDTHS.defaultPriceLine,
} satisfies Omit<HorizontalLineStyle, 'color'>

/**
 * Creates a standardized horizontal line using coord format for alignment with
 * custom series rectangles and native ECharts markLine conversion.
 */
const createHorizontalLine = (
  xStart: number,
  xEnd: number,
  yValue: number,
  color: string,
  style?: Partial<Omit<HorizontalLineStyle, 'color'>>,
): HorizontalLine => ({
  startPoint: { coord: [xStart, yValue] },
  endPoint: { coord: [xEnd, yValue] },
  lineStyle: { color, ...DEFAULT_HORIZONTAL_LINE_STYLE, ...style },
})

const createRangeBoundaryLines = (
  rangeOverlay: BandsRangeOverlay,
  xStart: number,
  xEnd: number,
): HorizontalLine[] => [
  // Build both range boundaries here; chartOptions owns z-order and overlap
  // filtering because those rules depend on the full set of visible overlays.
  createHorizontalLine(xStart, xEnd, rangeOverlay.upperPrice, rangeOverlay.topLineColor),
  createHorizontalLine(xStart, xEnd, rangeOverlay.lowerPrice, rangeOverlay.bottomLineColor),
]

const createOracleReferenceLine = (
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): HorizontalLine[] => {
  if (!oraclePrice) return []
  const price = Number(oraclePrice)

  return [createHorizontalLine(xStart, xEnd, price, palette.oraclePriceLineColor, DEFAULT_ORACLE_PRICE_LINE_STYLE)]
}

export const generateRangeBoundaryLines = (
  rangeOverlay: BandsRangeOverlay,
  xStart: number,
  xEnd: number,
): HorizontalLine[] => createRangeBoundaryLines(rangeOverlay, xStart, xEnd)

export const generateOracleReferenceLines = (
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): HorizontalLine[] => createOracleReferenceLine(oraclePrice, xStart, xEnd, palette)
