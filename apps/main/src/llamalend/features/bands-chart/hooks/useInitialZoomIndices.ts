import { useMemo } from 'react'
import { ChartDataPoint, ParsedBandsBalances } from '../types'

const getBandDelta = (band: ChartDataPoint, multiplier = 2) => (band.p_up - band.p_down) * multiplier

/** Calculate padded range from bands */
const getPaddedRange = (startBand: ChartDataPoint, endBand: ChartDataPoint) => ({
  startValue: startBand.pUpDownMedian - getBandDelta(startBand),
  endValue: endBand.pUpDownMedian + getBandDelta(endBand),
})

/** Find oracle band in chart data */
const findOracleBand = (chartData: ChartDataPoint[], oraclePrice: string | undefined): ChartDataPoint | undefined => {
  if (!oraclePrice) return undefined

  const oraclePriceNum = Number(oraclePrice)
  return chartData.find((d) => d.isOraclePriceBand || (oraclePriceNum >= d.p_down && oraclePriceNum <= d.p_up))
}

/** Get user band range from chart data */
const getUserBandRange = (
  chartData: ChartDataPoint[],
  userBandsBalances: ParsedBandsBalances[],
): { start: ChartDataPoint; end: ChartDataPoint } | null => {
  if (userBandsBalances.length === 0) return null

  const userBandNumbers = new Set(userBandsBalances.map((b) => b.n))
  const userBands = chartData.filter((d) => userBandNumbers.has(d.n))

  if (userBands.length === 0) return null

  return { start: userBands[0], end: userBands[userBands.length - 1] }
}

type OraclePosition = 'above' | 'below' | 'within' | 'none'

/** Determine oracle position relative to a range */
const getOraclePosition = (
  oracleBand: ChartDataPoint | undefined,
  startBand: ChartDataPoint,
  endBand: ChartDataPoint,
): OraclePosition => {
  if (!oracleBand) return 'none'
  if (oracleBand.p_up > endBand.p_up) return 'above'
  if (oracleBand.p_down < startBand.p_down) return 'below'
  return 'within'
}

export const useInitialZoomIndices = (
  chartData: ChartDataPoint[],
  userBandsBalances: ParsedBandsBalances[],
  oraclePrice: string | undefined,
): { startValue: number; endValue: number } | null =>
  useMemo(() => {
    if (chartData.length === 0) return null

    const firstBand = chartData[0]
    const lastBand = chartData[chartData.length - 1]
    const oracleBand = findOracleBand(chartData, oraclePrice)
    const userRange = getUserBandRange(chartData, userBandsBalances)

    // Determine the relevant range (user bands or full chart)
    const relevantStart = userRange?.start ?? firstBand
    const relevantEnd = userRange?.end ?? lastBand

    const oraclePosition = getOraclePosition(oracleBand, relevantStart, relevantEnd)

    // No oracle and no user position: show full chart
    if (oraclePosition === 'none' && !userRange) {
      return getPaddedRange(firstBand, lastBand)
    }

    // Calculate range based on oracle position
    const topBand = oraclePosition === 'above' ? oracleBand! : relevantStart
    const bottomBand = oraclePosition === 'below' ? oracleBand! : relevantEnd

    return getPaddedRange(topBand, bottomBand)
  }, [chartData, userBandsBalances, oraclePrice])
