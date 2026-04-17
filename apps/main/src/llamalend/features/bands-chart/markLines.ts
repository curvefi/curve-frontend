import { BandsChartPalette, UserBandsPriceRange } from './types'

/**
 * MarkLine data structure for ECharts coord format
 * Each markLine is an array of two coordinate points: [startPoint, endPoint]
 * Includes lineStyle metadata for label styling
 */
type MarkLine = [{ coord: [number, number] }, { coord: [number, number] }] & {
  lineStyle: { color: string; type: string; width: number }
}

/**
 * Creates a standardized mark line configuration using coord format
 * for proper alignment with custom series rectangles
 */
const createMarkLine = (
  xStart: number,
  xEnd: number,
  yValue: number,
  color: string,
  type: string = 'dashed',
  width: number = 2,
): MarkLine => {
  const line: MarkLine = [{ coord: [xStart, yValue] }, { coord: [xEnd, yValue] }] as MarkLine
  line.lineStyle = { color, type, width }
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

  return [createMarkLine(xStart, xEnd, price, palette.oraclePriceLineColor)]
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
