import { formatNumber } from '@ui/utils'
import { ChartDataPoint, BandsChartPalette, UserBandsPriceRange } from './types'
import { findBandIndexByPrice, findClosestBandIndex } from './utils'

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
      userBandsPriceRange.maxUserIdx,
      `$${formatNumber(userBandsPriceRange.lowerBandPriceDown, { notation: 'compact' })}`,
      'insideEndTop',
      palette.userRangeLabelBackgroundColor,
    ),
    createMarkLine(
      userBandsPriceRange.minUserIdx,
      `$${formatNumber(userBandsPriceRange.upperBandPriceUp, { notation: 'compact' })}`,
      'insideEndBottom',
      palette.userRangeLabelBackgroundColor,
    ),
  ]
}

/**
 * Generates mark line for oracle price
 */
const createOraclePriceMarkLine = (
  chartData: ChartDataPoint[],
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
): MarkLine[] => {
  if (!oraclePrice) return []

  let oracleIdx = findBandIndexByPrice(chartData, Number(oraclePrice))
  if (oracleIdx === -1) {
    oracleIdx = findClosestBandIndex(chartData, Number(oraclePrice))
  }

  if (oracleIdx === -1) return []

  return [
    createMarkLine(
      oracleIdx,
      `$${formatNumber(oraclePrice, { notation: 'compact' })}`,
      'insideEndTop',
      palette.oraclePriceLineColor,
    ),
  ]
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
      : palette.userRangeLabelBackgroundColor,
  color: lineStyle.color === palette.oraclePriceLineColor ? palette.textColorInverted : palette.textColor,
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
