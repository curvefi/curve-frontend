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
      marketData.push(d.bandCollateralValueUsd + d.bandBorrowedValueUsd)
      userData.push(d.userBandCollateralValueUsd + d.userBandBorrowedValueUsd)
      isLiquidation.push(d.isLiquidationBand === 'SL')
    }

    return { yAxisData, marketData, userData, isLiquidation }
  }, [chartData])
