import { useMemo } from 'react'
import { ChartDataPoint, ParsedBandsBalances } from '../types'

export const useInitialZoomIndices = (
  chartData: ChartDataPoint[],
  userBandsBalances: ParsedBandsBalances[],
  oraclePrice: string | undefined,
): { startIndex: number; endIndex: number } | null =>
  useMemo(() => {
    if (chartData.length === 0) return null
    if (userBandsBalances.length === 0) return { startIndex: 0, endIndex: chartData.length - 1 }

    // Find user band indices
    const userBandNumbers = new Set(userBandsBalances.map((b) => String(b.n)))
    const userIndices = chartData.map((d, i) => (userBandNumbers.has(String(d.n)) ? i : -1)).filter((i) => i !== -1)

    if (userIndices.length === 0) return { startIndex: 0, endIndex: chartData.length - 1 }

    let startIndex = Math.min(...userIndices)
    let endIndex = Math.max(...userIndices)

    // Include oracle price band if available
    const oracleIdx =
      chartData.findIndex((d) => d.isOraclePriceBand) ||
      (oraclePrice ? chartData.findIndex((d) => Math.abs(d.pUpDownMedian - Number(oraclePrice)) < 0.01) : -1)

    if (oracleIdx !== -1) {
      startIndex = Math.min(startIndex, oracleIdx)
      endIndex = Math.max(endIndex, oracleIdx)
    }

    // Add padding
    const pad = 2
    return {
      startIndex: Math.max(0, startIndex - pad),
      endIndex: Math.min(chartData.length - 1, endIndex + pad),
    }
  }, [chartData, userBandsBalances, oraclePrice])
