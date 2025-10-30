import type { EChartsOption } from 'echarts-for-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ParsedBandsBalances } from '../types'

type ZoomRange = {
  start?: number
  end?: number
}

type Params = {
  option: EChartsOption
  chartDataLength: number
  initialZoomIndices: { startIndex: number; endIndex: number } | null
  userBandsBalances: ParsedBandsBalances[]
}

export const useBandsChartZoom = ({
  option,
  chartDataLength,
  initialZoomIndices,
  userBandsBalances,
}: Params): EChartsOption => {
  const [initialZoom, setInitialZoom] = useState<ZoomRange>({})
  const prevUserBandsRef = useRef(new Set<string>())
  const lastAppliedZoomRef = useRef<{ startIndex: number; endIndex: number; length: number } | null>(null)

  useEffect(() => {
    const currentUserBands = new Set(userBandsBalances.map((band) => String(band.n)))
    const prevUserBands = prevUserBandsRef.current

    const bandsChanged =
      currentUserBands.size !== prevUserBands.size ||
      Array.from(currentUserBands).some((band) => !prevUserBands.has(band))

    const lastAppliedZoom = lastAppliedZoomRef.current
    const zoomParamsChanged =
      !!initialZoomIndices &&
      (!lastAppliedZoom ||
        lastAppliedZoom.length !== chartDataLength ||
        lastAppliedZoom.startIndex !== initialZoomIndices.startIndex ||
        lastAppliedZoom.endIndex !== initialZoomIndices.endIndex)

    if (chartDataLength > 0 && initialZoomIndices && (bandsChanged || zoomParamsChanged)) {
      const start = (initialZoomIndices.startIndex / chartDataLength) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartDataLength) * 100

      setInitialZoom({ start, end })
      lastAppliedZoomRef.current = {
        startIndex: initialZoomIndices.startIndex,
        endIndex: initialZoomIndices.endIndex,
        length: chartDataLength,
      }
    } else if (!initialZoomIndices && lastAppliedZoom) {
      setInitialZoom({})
      lastAppliedZoomRef.current = null
    }

    prevUserBandsRef.current = currentUserBands
  }, [chartDataLength, initialZoomIndices, userBandsBalances])

  return useMemo(() => {
    if (!option.dataZoom) {
      return option
    }

    const zoomedDataZoom = option.dataZoom.map((zoom: Record<string, unknown>) => {
      if (zoom && 'type' in zoom && zoom.type === 'slider') {
        return {
          ...zoom,
          ...(initialZoom.start != null && { start: initialZoom.start }),
          ...(initialZoom.end != null && { end: initialZoom.end }),
        }
      }

      return zoom
    })

    return {
      ...option,
      dataZoom: zoomedDataZoom,
    }
  }, [option, initialZoom])
}
