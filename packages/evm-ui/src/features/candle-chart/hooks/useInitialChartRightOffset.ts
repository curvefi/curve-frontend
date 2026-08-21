import type { IChartApi } from 'lightweight-charts'
import { useEffect, useRef, type RefObject } from 'react'

type Params = {
  chartRef: RefObject<IChartApi | null>
  hasSeriesData: boolean
}

export const useInitialChartRightOffset = ({ chartRef, hasSeriesData }: Params) => {
  const hasAppliedInitialOffsetRef = useRef(false)

  // Apply initial right-side spacing once after the chart has data and a non-zero rendered width.
  useEffect(() => {
    if (!chartRef.current || !hasSeriesData || hasAppliedInitialOffsetRef.current) return

    const timeScale = chartRef.current.timeScale()
    const applyInitialRightOffset = () => {
      requestAnimationFrame(() => {
        if (!chartRef.current || hasAppliedInitialOffsetRef.current) return

        const chartWidth = timeScale.width()
        const barSpacing = timeScale.options().barSpacing

        if (chartWidth > 0 && barSpacing > 0) {
          const paddingBars = (chartWidth * 0.1) / barSpacing
          timeScale.scrollToPosition(paddingBars, false)
          hasAppliedInitialOffsetRef.current = true
        }
      })
    }

    timeScale.subscribeSizeChange(applyInitialRightOffset)
    applyInitialRightOffset()

    return () => {
      timeScale.unsubscribeSizeChange(applyInitialRightOffset)
    }
  }, [chartRef, hasSeriesData])
}
