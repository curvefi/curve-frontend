import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'

export type ChartColors = {
  backgroundColor: string
  lineColor: string
  textColor: string
  green: string
  red: string
  cursorLabel: string
  cursorVertLine: string
  volumeRed: string
  volumeGreen: string
  oraclePrice: string
  rangeBackground: string
  rangeLine: string
  rangeBackgroundOld: string
  rangeLineOld: string
}

type UseChartPaletteOptions = {
  backgroundOverride?: string
}

export function useChartPalette(options?: UseChartPaletteOptions): ChartColors {
  const theme = useTheme()

  const backgroundColor = options?.backgroundOverride ?? theme.palette.background.paper
  const primary = theme.palette.primary.main
  const success = theme.design.Chart.Candles.Positive
  const error = theme.design.Chart.Candles.Negative
  const textPrimary = theme.palette.text.primary
  const textHighlight = theme.palette.text.highlight
  const rangeLine = theme.design.Chart.Lines.Line2
  const rangeBackground = theme.design.Chart.LiquidationZone.Current
  const rangeLineOld = theme.design.Chart.Lines.Line3
  const rangeBackgroundOld = theme.design.Chart.LiquidationZone.Future
  const oraclePrice = primary
  const cursorVertLine = theme.design.Chart.Lines.Line1

  return useMemo(
    () => ({
      backgroundColor,
      lineColor: primary,
      textColor: textPrimary,
      green: success,
      red: error,
      cursorLabel: textHighlight,
      cursorVertLine,
      volumeRed: error,
      volumeGreen: success,
      oraclePrice,
      rangeBackground,
      rangeLine,
      rangeBackgroundOld,
      rangeLineOld,
    }),
    [
      backgroundColor,
      primary,
      textPrimary,
      success,
      error,
      textHighlight,
      cursorVertLine,
      oraclePrice,
      rangeBackground,
      rangeLine,
      rangeBackgroundOld,
      rangeLineOld,
    ],
  )
}
