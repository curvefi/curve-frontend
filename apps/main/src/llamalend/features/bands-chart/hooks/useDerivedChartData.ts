import { useMemo } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalSum, ZERO } from '@ui-kit/utils/decimal'
import type { ChartDataPoint, DerivedChartData } from '../types'

const toNumber = (value: Decimal | undefined): number => Number(value ?? ZERO)

/**
 * Derives chart-specific data from raw band data
 *
 * Transforms the raw chart data into arrays optimized for ECharts rendering:
 * - yAxisData: Price values for the y-axis (median of band price range)
 * - userData: User's current position value per band, denominated in the borrow token
 * - bandTotalData: Total band value per band, denominated in the borrow token
 * - isLiquidation: Flags indicating if a band is in soft liquidation
 *
 * @param chartData - Raw chart data points
 * @returns Derived data optimized for chart rendering
 */
export const useDerivedChartData = (chartData: ChartDataPoint[]): DerivedChartData =>
  useMemo(() => {
    const yAxisData: number[] = []
    const userCollateralData: number[] = []
    const userBorrowedData: number[] = []
    const bandTotalData: number[] = []
    const isLiquidation: boolean[] = []

    for (const d of chartData) {
      // Use median price for y-axis labels
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      yAxisData.push(d.pUpDownMedian)

      const userCollateralValue = d.userBandCollateralValue
      const userBorrowedValue = d.userBandBorrowedAmount
      const totalBandValue = d.bandTotalValue ?? decimalSum(userCollateralValue, userBorrowedValue)

      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      userCollateralData.push(toNumber(userCollateralValue))
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      userBorrowedData.push(toNumber(userBorrowedValue))
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      bandTotalData.push(toNumber(totalBandValue))
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      isLiquidation.push(d.isLiquidationBand)
    }

    return { yAxisData, userCollateralData, userBorrowedData, bandTotalData, isLiquidation }
  }, [chartData])
