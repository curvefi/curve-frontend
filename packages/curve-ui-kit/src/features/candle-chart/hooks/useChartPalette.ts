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

export function useChartPalette(): ChartColors {
  const theme = useTheme()
  return useMemo(() => {
    const {
      design: {
        Color: { Neutral },
        Chart: {
          Candles: { Negative, Positive },
          LiquidationZone: { Current, CurrentBottomLine, CurrentTopLine, Future, FutureLine },
          Lines,
        },
        Layer: Layer,
      },
      palette: {
        primary: { main: primary },
        text: { highlight, tertiary },
      },
    } = theme

    return {
      backgroundColor: Layer[1].Fill,
      lineColor: primary,
      textColor: tertiary,
      gridLine: Neutral[300],
      green: Positive,
      red: Negative,
      cursorLabel: highlight,
      cursorVertLine: Lines[1],
      volumeRed: Negative,
      volumeGreen: Positive,
      oraclePrice: primary,
      rangeBackground: Current,
      rangeLineTop: CurrentTopLine,
      rangeLineBottom: CurrentBottomLine,
      rangeBackgroundFuture: Future,
      rangeLineFutureTop: FutureLine,
      rangeLineFutureBottom: FutureLine,
    }
  }, [theme])
}
