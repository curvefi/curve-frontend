import { useMemo } from 'react'
import { ChartDataPoint, DerivedChartData } from '../types'

export const useDerivedChartData = (chartData: ChartDataPoint[]): DerivedChartData =>
  useMemo(() => {
    const yAxisData: number[] = []
    const marketData: number[] = []
    const userData: number[] = []
    const isLiquidation: boolean[] = []

    for (const d of chartData) {
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
