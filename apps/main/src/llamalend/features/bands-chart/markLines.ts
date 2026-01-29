import { formatNumberWithOptions } from './bands-chart.utils'
import { ChartDataPoint, BandsChartPalette, UserBandsPriceRange } from './types'

/**
 * MarkLine data structure for ECharts coord format
 * Each markLine is an array of two coordinate points: [startPoint, endPoint]
 * Includes lineStyle metadata for label styling
 */
export type MarkLine = [
  { coord: [number, number]; label: { formatter: string; position: string } },
  { coord: [number, number] },
] & {
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
  formatter: string,
  position: string,
  color: string,
  type: string = 'dashed',
  width: number = 2,
): MarkLine => {
  const line: MarkLine = [
    { coord: [xStart, yValue], label: { formatter, position } },
    { coord: [xEnd, yValue] },
  ] as MarkLine
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
    createMarkLine(
      xStart,
      xEnd,
      userBandsPriceRange.lowerBandPriceDown,
      formatNumberWithOptions(userBandsPriceRange.lowerBandPriceDown),
      'end',
      palette.userRangeTopLabelBackgroundColor,
    ),
    createMarkLine(
      xStart,
      xEnd,
      userBandsPriceRange.upperBandPriceUp,
      formatNumberWithOptions(userBandsPriceRange.upperBandPriceUp),
      'end',
      palette.userRangeBottomLabelBackgroundColor,
    ),
  ]
}

const createOraclePriceMarkLine = (
  _chartData: ChartDataPoint[],
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): MarkLine[] => {
  if (!oraclePrice) return []
  const price = Number(oraclePrice)
  if (!Number.isFinite(price)) return []

  return [createMarkLine(xStart, xEnd, price, formatNumberWithOptions(price), 'end', palette.oraclePriceLineColor)]
}

export const generateMarkLines = (
  chartData: ChartDataPoint[],
  userBandsPriceRange: UserBandsPriceRange,
  oraclePrice: string | undefined,
  xStart: number,
  xEnd: number,
  palette: BandsChartPalette,
): MarkLine[] => [
  ...createUserRangeMarkLines(userBandsPriceRange, xStart, xEnd, palette),
  ...createOraclePriceMarkLine(chartData, oraclePrice, xStart, xEnd, palette),
]

/**
 * Creates label styling based on line color
 */
export const createLabelStyle = (lineStyle: { color: string }, palette: BandsChartPalette) => ({
  padding: [2, 4],
  fontSize: 12,
  backgroundColor:
    lineStyle.color === palette.oraclePriceLineColor
      ? palette.oraclePriceLineColor
      : lineStyle.color === palette.userRangeTopLabelBackgroundColor
        ? palette.userRangeTopLabelBackgroundColor
        : palette.userRangeBottomLabelBackgroundColor,
  color:
    lineStyle.color === palette.oraclePriceLineColor || lineStyle.color === palette.userRangeTopLabelBackgroundColor
      ? palette.userRangeTopLabelTextColor
      : palette.userRangeBottomLabelTextColor,
})
