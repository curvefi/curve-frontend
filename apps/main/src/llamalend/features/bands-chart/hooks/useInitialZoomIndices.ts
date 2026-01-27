import { useMemo } from 'react'
import { ChartDataPoint, ParsedBandsBalances } from '../types'

type ChartBandData = Pick<ChartDataPoint, 'pUpDownMedian' | 'p_up' | 'p_down'>

const getBandDelta = (band: ChartBandData, multiplier = 2) => (band.p_up - band.p_down) * multiplier

/** Calculate padded range from bands */
const getPaddedRange = (startBand: ChartBandData, endBand: ChartBandData) => ({
  startValue: startBand.pUpDownMedian - getBandDelta(startBand),
  endValue: endBand.pUpDownMedian + getBandDelta(endBand),
})

/** Get user band range from chart data */
const getUserBandRange = (
  chartData: ChartDataPoint[],
  userBandsBalances: ParsedBandsBalances[],
): { start: ChartDataPoint; end: ChartDataPoint } | null => {
  if (!userBandsBalances.length) return null

  const userBandNumbers = new Set(userBandsBalances.map((b) => b.n))
  const userBands = chartData.filter((d) => userBandNumbers.has(d.n))

  return userBands.length ? { start: userBands[0], end: userBands[userBands.length - 1] } : null
}

type OraclePosition = 'above' | 'below' | 'within' | 'none'

/** Determine oracle position relative to a range */
const getOraclePosition = (oracleValue: number, startBand: ChartDataPoint, endBand: ChartDataPoint): OraclePosition => {
  if (!oracleValue) return 'none'
  if (oracleValue > endBand.p_up) return 'above'
  if (oracleValue < startBand.p_down) return 'below'
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
    const oracleValue = Number(oraclePrice)
    const userRange = getUserBandRange(chartData, userBandsBalances)

    // No oracle and no user position: show full chart while making sure oracle is visible even if not inside a band
    if (!userRange) {
      const oraclePosition = getOraclePosition(oracleValue, lastBand, firstBand)
      const topBand =
        oraclePosition === 'above'
          ? { pUpDownMedian: oracleValue, p_up: firstBand.p_up, p_down: firstBand.p_down }
          : firstBand
      const bottomBand =
        oraclePosition === 'below'
          ? { pUpDownMedian: oracleValue, p_up: lastBand.p_up, p_down: lastBand.p_down }
          : lastBand
      return getPaddedRange(topBand, bottomBand)
    }

    const relevantStart = userRange.start
    const relevantEnd = userRange.end
    const oraclePosition = getOraclePosition(oracleValue, relevantStart, relevantEnd)

    // Calculate range based on oracle position
    const topBand =
      oraclePosition === 'above'
        ? { pUpDownMedian: oracleValue, p_up: firstBand.p_up, p_down: firstBand.p_down }
        : relevantStart
    const bottomBand =
      oraclePosition === 'below'
        ? { pUpDownMedian: oracleValue, p_up: lastBand.p_up, p_down: lastBand.p_down }
        : relevantEnd

    return getPaddedRange(topBand, bottomBand)
  }, [chartData, userBandsBalances, oraclePrice])
