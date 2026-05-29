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

export function useChartPalette({ backgroundOverride }: { backgroundOverride?: string } = {}): ChartColors {
  const {
    design,
    palette: {
      background,
      primary: { main: primary },
      text,
    },
  } = useTheme()

  const backgroundColor = useMemo(
    () =>
      backgroundOverride ??
      getComputedStyle(document.body ?? document.documentElement)
        .getPropertyValue('--box--secondary--background-color')
        .trim() ??
      background.paper,
    [background.paper, backgroundOverride],
  )

  const success = design.Chart.Candles.Positive
  const error = design.Chart.Candles.Negative
  const textPrimary = text.tertiary
  const textHighlight = text.highlight
  const rangeLineTop = design.Chart.LiquidationZone.CurrentTopLine
  const rangeLineBottom = design.Chart.LiquidationZone.CurrentBottomLine
  const rangeBackground = design.Chart.LiquidationZone.Current
  const rangeLineFutureTop = design.Chart.LiquidationZone.FutureLine
  const rangeLineFutureBottom = design.Chart.LiquidationZone.FutureLine
  const rangeBackgroundFuture = design.Chart.LiquidationZone.Future
  const oraclePrice = primary
  const cursorVertLine = design.Chart.Lines[1]
  const gridLine = design.Color.Neutral[300]

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
