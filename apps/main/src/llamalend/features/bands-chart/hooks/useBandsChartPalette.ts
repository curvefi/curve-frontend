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
      userRangeHighlightColor: theme.design.Color.Tertiary[200],
      userRangeLabelBackgroundColor: theme.design.Color.Tertiary[300],
      oraclePriceLineColor: theme.design.Color.Primary[500],
      liquidationBandOutlineColor: theme.design.Color.Tertiary[600],
    }),
    [theme.design, invertedDesign],
  )
}
