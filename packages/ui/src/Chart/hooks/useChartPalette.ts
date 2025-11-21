import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'

export type ChartColors = {
  backgroundColor: string
  lineColor: string
  textColor: string
  gridLine: string
  green: string
  red: string
  cursorLabel: string
  cursorVertLine: string
  volumeRed: string
  volumeGreen: string
  oraclePrice: string
  rangeBackground: string
  rangeLineTop: string
  rangeLineBottom: string
  rangeBackgroundFuture: string
  rangeLineFutureTop: string
  rangeLineFutureBottom: string
}

type UseChartPaletteOptions = {
  backgroundOverride?: string
}

export function useChartPalette(options?: UseChartPaletteOptions): ChartColors {
  const theme = useTheme()

  const legacyBackground =
    typeof window === 'undefined'
      ? undefined
      : getComputedStyle(document.body ?? document.documentElement)
          .getPropertyValue('--box--secondary--background-color')
          .trim()

  const backgroundColor = options?.backgroundOverride ?? legacyBackground ?? theme.palette.background.paper
  const primary = theme.palette.primary.main
  const success = theme.design.Chart.Candles.Positive
  const error = theme.design.Chart.Candles.Negative
  const textPrimary = theme.palette.text.tertiary
  const textHighlight = theme.palette.text.highlight
  const rangeLineTop = error
  const rangeLineBottom = theme.design.Chart.Lines.Line2
  const rangeBackground = theme.design.Chart.LiquidationZone.Current
  const rangeLineFutureTop = theme.design.Chart.Lines.Line1
  const rangeLineFutureBottom = theme.design.Chart.Lines.Line1
  const rangeBackgroundFuture = theme.design.Chart.LiquidationZone.Future
  const oraclePrice = primary
  const cursorVertLine = theme.design.Chart.Lines.Line1
  const gridLine = theme.design.Color.Neutral[300]

  return useMemo(
    () => ({
      backgroundColor,
      lineColor: primary,
      textColor: textPrimary,
      gridLine,
      green: success,
      red: error,
      cursorLabel: textHighlight,
      cursorVertLine,
      volumeRed: error,
      volumeGreen: success,
      oraclePrice,
      rangeBackground,
      rangeLineTop,
      rangeLineBottom,
      rangeBackgroundFuture,
      rangeLineFutureTop,
      rangeLineFutureBottom,
    }),
    [
      backgroundColor,
      primary,
      textPrimary,
      gridLine,
      success,
      error,
      textHighlight,
      cursorVertLine,
      oraclePrice,
      rangeBackground,
      rangeLineTop,
      rangeLineBottom,
      rangeBackgroundFuture,
      rangeLineFutureTop,
      rangeLineFutureBottom,
    ],
  )
}
