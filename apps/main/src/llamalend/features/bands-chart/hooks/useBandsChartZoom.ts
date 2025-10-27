import { type EChartsOption } from 'echarts-for-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'

type InitialZoomIndices = {
  startIndex: number
  endIndex: number
}

/**
 * Hook to manage zoom state and apply it to ECharts options
 *
 * Handles:
 * - Initial zoom calculation based on user bands and oracle price
 * - Re-zoom when user bands change
 * - Applying zoom configuration to chart options
 */
export const useBandsChartZoom = (
  option: EChartsOption,
  chartData: ChartDataPoint[],
  initialZoomIndices: InitialZoomIndices | null,
  userBandsBalances: ParsedBandsBalances[],
) => {
  const [initialZoom, setInitialZoom] = useState<{ start?: number; end?: number }>({})
  const hasInitializedZoomRef = useRef<boolean>(false)
  const prevUserBandsRef = useRef<Set<string>>(new Set())
  const zoomAppliedRef = useRef<boolean>(false)

  // Calculate initial zoom range based on user bands and oracle price
  // Only set zoom on initial mount or when user's bands change
  useEffect(() => {
    const currentUserBands = new Set(userBandsBalances.map((band) => String(band.n)))
    const prevUserBands = prevUserBandsRef.current

    // Check if bands have changed
    const bandsChanged =
      currentUserBands.size !== prevUserBands.size ||
      Array.from(currentUserBands).some((band) => !prevUserBands.has(band))

    // Apply zoom only when we have both market bands (chartData) and user bands loaded
    // This ensures zoom is calculated with complete data including oracle price and user range
    if (
      chartData.length > 0 &&
      userBandsBalances.length > 0 &&
      initialZoomIndices &&
      (!hasInitializedZoomRef.current || bandsChanged)
    ) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      setInitialZoom({ start, end })
      hasInitializedZoomRef.current = true
      prevUserBandsRef.current = currentUserBands
      // Mark that new zoom values need to be applied
      zoomAppliedRef.current = false
    }
  }, [chartData.length, initialZoomIndices, userBandsBalances])

  // Memoize the final chart option with dataZoom configuration
  const finalOption = useMemo(() => {
    if (!option.dataZoom) return option

    // Only apply initial zoom values if they exist and haven't been applied yet
    // After first application, subsequent renders preserve user's manual zoom
    const shouldApplyZoom = !zoomAppliedRef.current && (initialZoom.start != null || initialZoom.end != null)

    if (shouldApplyZoom) {
      // Mark zoom as applied so it won't be included in subsequent renders
      zoomAppliedRef.current = true
    }

    return {
      ...option,
      dataZoom: option.dataZoom.map((zoom: Record<string, unknown>) => {
        if (zoom && 'type' in zoom && zoom.type === 'slider') {
          return {
            ...zoom,
            ...(shouldApplyZoom && initialZoom.start != null && { start: initialZoom.start }),
            ...(shouldApplyZoom && initialZoom.end != null && { end: initialZoom.end }),
          }
        }
        return zoom
      }),
    }
  }, [option, initialZoom])

  return finalOption
}
