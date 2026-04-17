import { useMemo } from 'react'
import { useTheme } from '@mui/material'
import { BandsChartPalette } from '../types'

/**
 * Hook to get the bands chart palette
 * @returns The bands chart palette
 */
export const useBandsChartPalette = (): BandsChartPalette => {
  const theme = useTheme()

  return useMemo(
    () => ({
      gridColor: theme.design.Color.Neutral[300],
      scaleLabelsColor: theme.design.Text.TextColors.Tertiary,
      marketBandColor: theme.design.Chart.Surfaces[1],
      userCollateralShareColor: theme.design.Chart.Lines.Line1,
      userBorrowedShareColor: theme.design.Chart.Lines.Line2,
      userRangeBackgroundColor: theme.design.Chart.LiquidationZone.Current,
      userRangeTopLineColor: theme.design.Chart.Candles.Negative,
      userRangeBottomLineColor: theme.design.Chart.Lines.Line2,
      oraclePriceLineColor: theme.design.Color.Primary[500],
      liquidationBandOutlineColor: theme.design.Chart.Candles.Negative,
    }),
    [theme.design],
  )
}
