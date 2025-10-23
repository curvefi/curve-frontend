import { useMemo } from 'react'
import { ChartDataPoint, ParsedBandsBalances } from '../types'

/**
 * Calculates initial zoom range for the chart
 *
 * Determines which portion of the chart should be visible initially based on:
 * 1. User's band positions (if any)
 * 2. Oracle price location
 * 3. Adds padding around the region of interest
 *
 * This improves UX by focusing on the most relevant bands when the chart loads
 *
 * @param chartData - All available chart data points
 * @param userBandsBalances - User's positions in specific bands
 * @param oraclePrice - Current oracle price
 * @returns Start and end indices for initial zoom, or null if no data
 */
export const useInitialZoomIndices = (
  chartData: ChartDataPoint[],
  userBandsBalances: ParsedBandsBalances[],
  oraclePrice: string | undefined,
): { startIndex: number; endIndex: number } | null =>
  useMemo(() => {
    if (chartData.length === 0) return null

    // If no user positions, show entire chart
    if (userBandsBalances.length === 0) {
      return { startIndex: 0, endIndex: chartData.length - 1 }
    }

    // Find indices of user's bands
    const userBandNumbers = new Set(userBandsBalances.map((b) => String(b.n)))
    const userIndices = chartData.map((d, i) => (userBandNumbers.has(String(d.n)) ? i : -1)).filter((i) => i !== -1)

    if (userIndices.length === 0) {
      return { startIndex: 0, endIndex: chartData.length - 1 }
    }

    let startIndex = Math.min(...userIndices)
    let endIndex = Math.max(...userIndices)

    // Expand range to include oracle price if available
    const oracleIdx =
      chartData.findIndex((d) => d.isOraclePriceBand) ||
      (oraclePrice ? chartData.findIndex((d) => Math.abs(d.pUpDownMedian - Number(oraclePrice)) < 0.01) : -1)

    if (oracleIdx !== -1) {
      startIndex = Math.min(startIndex, oracleIdx)
      endIndex = Math.max(endIndex, oracleIdx)
    }

    // Add padding to keep the areas of interest off the edges
    const pad = 2
    return {
      startIndex: Math.max(0, startIndex - pad),
      endIndex: Math.min(chartData.length - 1, endIndex + pad),
    }
  }, [chartData, userBandsBalances, oraclePrice])
