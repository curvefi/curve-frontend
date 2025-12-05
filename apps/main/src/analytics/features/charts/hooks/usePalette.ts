import { useTheme } from '@mui/material/styles'

export function usePalette() {
  const theme = useTheme()

  return {
    backgroundColor: 'transparent',
    gridLinesColor: theme.design.Color.Neutral[300],
    axisLabelsColor: theme.design.Color.Neutral[300],
    colors: [theme.design.Chart.Lines.Line1, theme.design.Chart.Lines.Line2, theme.design.Chart.Lines.Line3],
  }
}
