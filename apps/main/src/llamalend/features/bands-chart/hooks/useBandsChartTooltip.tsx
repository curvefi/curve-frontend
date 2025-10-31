import { useCallback, useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ChartDataPoint } from '@/llamalend/features/bands-chart/types'
import { Token } from '@/llamalend/features/borrow/types'
import { ThemeProvider, useTheme } from '@mui/material'
import { TooltipContent } from '../TooltipContent'

type TooltipParams = {
  dataIndex: number
}[]

/**
 * Custom hook for managing ECharts tooltip rendering with React components
 *
 * ECharts doesn't support React components directly, so this hook:
 * - Creates a DOM element for the tooltip
 * - Manages a React root for rendering
 * - Provides a formatter function for ECharts
 * - Handles cleanup on unmount
 */
export const useBandsChartTooltip = (chartData: ChartDataPoint[], collateralToken?: Token, borrowToken?: Token) => {
  const theme = useTheme()
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const tooltipRootRef = useRef<Root | null>(null)

  const tooltipFormatter = useCallback(
    (params: unknown) => {
      // Initialize tooltip container and React root on first render
      if (!tooltipRef.current) {
        tooltipRef.current = document.createElement('div')
        tooltipRootRef.current = createRoot(tooltipRef.current)
      }

      const typedParams = params as TooltipParams
      const dataPoint =
        Array.isArray(typedParams) && typedParams.length > 0 ? chartData[typedParams[0].dataIndex] : null

      // Render tooltip content or clear it
      if (dataPoint && tooltipRootRef.current) {
        tooltipRootRef.current.render(
          <ThemeProvider theme={theme}>
            <TooltipContent data={dataPoint} collateralToken={collateralToken} borrowToken={borrowToken} />
          </ThemeProvider>,
        )
      } else if (tooltipRootRef.current) {
        tooltipRootRef.current.render(null)
      }

      return tooltipRef.current
    },
    [chartData, collateralToken, borrowToken, theme],
  )

  // Cleanup tooltip React root on unmount
  useEffect(
    () => () => {
      tooltipRootRef.current?.unmount()
      tooltipRootRef.current = null
      tooltipRef.current = null
    },
    [],
  )

  return tooltipFormatter
}
