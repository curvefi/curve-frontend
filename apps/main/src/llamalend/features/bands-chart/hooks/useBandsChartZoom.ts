import type { EChartsOption } from 'echarts-for-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type ZoomReturn = {
  option: EChartsOption
  onDataZoom: (event: Record<string, unknown>) => void
}

export const useBandsChartZoom = ({
  option,
  chartDataLength,
  initialZoomIndices,
  userBandsBalances,
}: Params): ZoomReturn => {
  const [defaultZoom, setDefaultZoom] = useState<ZoomRange>({})
  const [userZoom, setUserZoom] = useState<ZoomRange | null>(null)
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

      setDefaultZoom({ start, end })
      setUserZoom(null)
      lastAppliedZoomRef.current = {
        startIndex: initialZoomIndices.startIndex,
        endIndex: initialZoomIndices.endIndex,
        length: chartDataLength,
      }
    } else if ((!initialZoomIndices || chartDataLength === 0) && lastAppliedZoom) {
      setDefaultZoom({})
      setUserZoom(null)
      lastAppliedZoomRef.current = null
    }

    prevUserBandsRef.current = currentUserBands
  }, [chartDataLength, initialZoomIndices, userBandsBalances])

  const handleDataZoom = useCallback((event: Record<string, unknown>) => {
    const batch = Array.isArray(event.batch) && event.batch.length > 0 ? event.batch[0] : null
    const start = (event.start ?? batch?.start) as number | undefined
    const end = (event.end ?? batch?.end) as number | undefined

    if (typeof start === 'number' || typeof end === 'number') {
      setUserZoom({
        ...(typeof start === 'number' ? { start } : {}),
        ...(typeof end === 'number' ? { end } : {}),
      })
    }
  }, [])

  const zoomedOption = useMemo(() => {
    if (!option.dataZoom) {
      return option
    }

    const zoomToApply = userZoom ?? defaultZoom

    const zoomedDataZoom = option.dataZoom.map((zoom: Record<string, unknown>) => {
      if (zoom && 'type' in zoom && zoom.type === 'slider') {
        return {
          ...zoom,
          ...(zoomToApply.start != null && { start: zoomToApply.start }),
          ...(zoomToApply.end != null && { end: zoomToApply.end }),
        }
      }

      return zoom
    })

    return {
      ...option,
      dataZoom: zoomedDataZoom,
    }
  }, [option, defaultZoom, userZoom])

  return {
    option: zoomedOption,
    onDataZoom: handleDataZoom,
  }
}
