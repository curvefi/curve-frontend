import { formatNumberWithOptions } from './bands-chart.utils'
import { ChartDataPoint, BandsChartPalette, UserBandsPriceRange } from './types'

type MarkLine = {
  yAxis: number
  label: { formatter: string; position: string }
  lineStyle: { color: string; type: string; width: number }
}

/**
 * Creates a standardized mark line configuration
 */
const createMarkLine = (
  yAxis: number,
  formatter: string,
  position: string,
  color: string,
  type: string = 'dashed',
  width: number = 2,
): MarkLine => ({
  yAxis,
  label: { formatter, position },
  lineStyle: { color, type, width },
})

/**
 * Generates mark lines for user band price range
 */
const createUserRangeMarkLines = (userBandsPriceRange: UserBandsPriceRange, palette: BandsChartPalette): MarkLine[] => {
  if (!userBandsPriceRange) return []

  return [
    createMarkLine(
      userBandsPriceRange.lowerBandPriceDown,
      formatNumberWithOptions(userBandsPriceRange.lowerBandPriceDown),
      'end',
      palette.userRangeTopLabelBackgroundColor,
    ),
    createMarkLine(
      userBandsPriceRange.upperBandPriceUp,
      formatNumberWithOptions(userBandsPriceRange.upperBandPriceUp),
      'end',
      palette.userRangeBottomLabelBackgroundColor,
    ),
  ]
}

/**
 * Generates mark line for oracle price
 */
const createOraclePriceMarkLine = (
  _chartData: ChartDataPoint[],
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
): MarkLine[] => {
  if (!oraclePrice) return []
  const price = Number(oraclePrice)
  if (!Number.isFinite(price)) return []

  return [createMarkLine(price, formatNumberWithOptions(price), 'end', palette.oraclePriceLineColor)]
}

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

/**
 * Generates all mark lines for the chart
 */
export const generateMarkLines = (
  chartData: ChartDataPoint[],
  userBandsPriceRange: UserBandsPriceRange,
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
): MarkLine[] => [
  ...createUserRangeMarkLines(userBandsPriceRange, palette),
  ...createOraclePriceMarkLine(chartData, oraclePrice, palette),
]
