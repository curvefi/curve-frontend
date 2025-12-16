import { useMemo } from 'react'
import { useTheme } from '@mui/material'
import { DesignSystem } from '@ui-kit/themes/design'
import { BandsChartPalette } from '../types'

/**
 * Hook to get the bands chart palette
 * @returns The bands chart palette
 */
export const useBandsChartPalette = (): BandsChartPalette => {
  const theme = useTheme()
  const { theme: currentThemeName } = theme.design
  const invertedDesign = useMemo(() => DesignSystem[currentThemeName]({ inverted: true }), [currentThemeName])

  return useMemo(
    () => ({
      backgroundColor: theme.design.Layer[1].Fill,
      textColor: theme.design.Text.TextColors.Primary,
      textColorInverted: invertedDesign.Text.TextColors.Primary,
      gridColor: theme.design.Color.Neutral[300],
      scaleLabelsColor: theme.design.Text.TextColors.Tertiary,
      marketBandColor: theme.design.Color.Neutral[300],
      userBandColor: theme.design.Color.Neutral[500],
      borderColor: theme.design.Layer[1].Outline,
      userRangeHighlightColor: theme.design.Chart.LiquidationZone.Current,
      userRangeTopLabelBackgroundColor: theme.design.Chart.Candles.Negative,
      userRangeTopLabelTextColor: theme.design.Text.TextColors.FilledFeedback.Alert.Primary,
      userRangeBottomLabelBackgroundColor: theme.design.Chart.Lines.Line2,
      userRangeBottomLabelTextColor: theme.design.Text.TextColors.FilledFeedback.Warning.Primary,
      oraclePriceLineColor: theme.design.Color.Primary[500],
      liquidationBandOutlineColor: theme.design.Color.Tertiary[600],
      zoomTrackBackgroundColor: theme.design.Color.Primary[200],
      zoomThumbColor: theme.design.Color.Primary[500],
      zoomThumbHandleBorderColor: theme.design.Text.TextColors.FilledFeedback.Highlight.Primary,
    }),
    [theme.design, invertedDesign],
  )
}
