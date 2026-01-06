import { useCallback, useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { BandsChartToken, ChartDataPoint } from '@/llamalend/features/bands-chart/types'
import { ThemeProvider, useTheme } from '@mui/material'
import { TooltipContent } from '../TooltipContent'

type TooltipArrayParams = { dataIndex: number }[]
type TooltipItemParams = { dataIndex: number }

/**
 * Custom hook for managing ECharts tooltip rendering with React components
 *
 * ECharts doesn't support React components directly, so this hook:
 * - Creates a DOM element for the tooltip
 * - Manages a React root for rendering
 * - Provides a formatter function for ECharts
 * - Handles cleanup on unmount
 */
export const useBandsChartTooltip = (
  chartData: ChartDataPoint[],
  collateralToken: BandsChartToken,
  borrowToken: BandsChartToken,
) => {
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

      let dataIndex: number | undefined
      if (Array.isArray(params)) {
        const arr = params as TooltipArrayParams
        dataIndex = arr.length > 0 ? arr[0].dataIndex : undefined
      } else if (params && typeof params === 'object' && 'dataIndex' in params) {
        dataIndex = (params as TooltipItemParams).dataIndex
      }

      const dataPoint = dataIndex != null ? chartData[dataIndex] : null

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
