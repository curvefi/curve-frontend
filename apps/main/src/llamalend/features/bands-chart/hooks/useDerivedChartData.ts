import { useMemo } from 'react'
import { ChartDataPoint, DerivedChartData } from '../types'

/**
 * Derives chart-specific data from raw band data
 *
 * Transforms the raw chart data into arrays optimized for ECharts rendering:
 * - yAxisData: Price values for the y-axis (median of band price range)
 * - marketData: Total market value per band
 * - userData: User's current position value per band
 * - isLiquidation: Flags indicating if a band is in soft liquidation
 *
 * @param chartData - Raw chart data points
 * @returns Derived data optimized for chart rendering
 */
export const useDerivedChartData = (chartData: ChartDataPoint[]): DerivedChartData =>
  useMemo(() => {
    const yAxisData: number[] = []
    const marketData: number[] = []
    const userData: number[] = []
    const isLiquidation: boolean[] = []

    for (const d of chartData) {
      // Use median price for y-axis labels
      yAxisData.push(d.pUpDownMedian)

      const totalBandValue = d.bandCollateralValueUsd + d.bandBorrowedValueUsd
      const userBandValue = d.userBandCollateralValueUsd + d.userBandBorrowedValueUsd
      const marketBandValue = totalBandValue - userBandValue

      marketData.push(marketBandValue)
      userData.push(userBandValue)
      isLiquidation.push(d.isLiquidationBand === 'SL')
    }

    return { yAxisData, marketData, userData, isLiquidation }
  }, [chartData])
