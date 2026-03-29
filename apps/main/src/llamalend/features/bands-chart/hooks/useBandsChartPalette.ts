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
      marketBandColor: theme.design.Color.Neutral[300],
      userBandColor: theme.design.Color.Neutral[500],
      userRangeHighlightColor: theme.design.Chart.LiquidationZone.Current,
      userRangeTopLabelBackgroundColor: theme.design.Chart.Candles.Negative,
      userRangeTopLabelTextColor: theme.design.Text.TextColors.FilledFeedback.Alert.Primary,
      userRangeBottomLabelBackgroundColor: theme.design.Chart.Lines.Line2,
      userRangeBottomLabelTextColor: theme.design.Text.TextColors.FilledFeedback.Warning.Primary,
      oraclePriceLineColor: theme.design.Color.Primary[500],
      liquidationBandOutlineColor: theme.design.Color.Tertiary[600],
    }),
    [theme.design],
  )
}
