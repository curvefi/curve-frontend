import {
  CHART_LINE_DASH_PATTERNS,
  CHART_LINE_WIDTHS,
  type ChartLineDashPattern,
} from '@ui-kit/shared/ui/Chart/chart.utils'
import { BandsChartPalette, UserBandsPriceRange } from './types'

/**
 * MarkLine data structure for ECharts coord format
 * Each markLine is an array of two coordinate points: [startPoint, endPoint]
 * Includes lineStyle metadata for label styling
 */
type MarkLine = [{ coord: [number, number] }, { coord: [number, number] }] & {
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
  style: Omit<MarkLineStyle, 'color'> = DEFAULT_MARK_LINE_STYLE,
): MarkLine => {
  const line: MarkLine = [{ coord: [xStart, yValue] }, { coord: [xEnd, yValue] }] as MarkLine
  line.lineStyle = { color, ...style }
  return line
}

const createUserRangeMarkLines = (
  userBandsPriceRange: UserBandsPriceRange,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): MarkLine[] => {
  if (!userBandsPriceRange) return []

  return [
    createMarkLine(xStart, xEnd, userBandsPriceRange.lowerBandPriceDown, palette.userRangeTopLineColor),
    createMarkLine(xStart, xEnd, userBandsPriceRange.upperBandPriceUp, palette.userRangeBottomLineColor),
  ]
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

export const generateMarkLines = (
  userBandsPriceRange: UserBandsPriceRange,
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): MarkLine[] => [
  ...createUserRangeMarkLines(userBandsPriceRange, xStart, xEnd, palette),
  ...createOraclePriceMarkLine(oraclePrice, xStart, xEnd, palette),
]
