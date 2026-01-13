import type { IChartApi, Time, ISeriesApi, LineWidth, IPriceLine, CustomSeriesWhitespaceData } from 'lightweight-charts'
import { createChart, ColorType, LineStyle, CandlestickSeries, LineSeries } from 'lightweight-charts'
import lodash from 'lodash'
import { useEffect, useRef, useState, useCallback, useMemo, type RefObject } from 'react'
import { styled } from 'styled-components'
import { createLiquidationRangeSeries } from './custom-series/liquidationRangeSeries'
import type { LiquidationRangePoint, LiquidationRangeSeriesOptions } from './custom-series/liquidationRangeSeries'
import type { ChartColors } from './hooks/useChartPalette'
import type { LpPriceOhlcDataFormatted, OraclePriceData, LiquidationRanges, LlammaLiquididationRange } from './types'
import { calculateRobustPriceRange, priceFormatter } from './utils'

export type OhlcChartTimeOption = '15m' | '30m' | '1h' | '4h' | '6h' | '12h' | '1d' | '7d' | '14d'

type RangeValueAccumulator = {
  upper?: number
  lower?: number
}

const normalizeLiquidationRangePoints = (range?: LlammaLiquididationRange | null): LiquidationRangePoint[] => {
  if (!range) return []

  const pointMap = new Map<number, RangeValueAccumulator>()

  const assignPoint = (time: number, key: keyof RangeValueAccumulator, value: number) => {
    const entry = pointMap.get(time) ?? {}
    entry[key] = value
    pointMap.set(time, entry)
  }

  range.price1?.forEach(({ time, value }) => assignPoint(time, 'upper', value))
  range.price2?.forEach(({ time, value }) => assignPoint(time, 'lower', value))

  const orderedEntries = Array.from(pointMap.entries())
    .filter(([, values]) => typeof values.upper === 'number' && typeof values.lower === 'number')
    .sort((a, b) => a[0] - b[0])

  if (!orderedEntries.length) {
    return []
  }

  const fallbackStart = orderedEntries[0][0] as Time
  const fallbackEnd = orderedEntries[orderedEntries.length - 1][0] as Time
  const rangeStartTime = (range.startTime ?? fallbackStart) as Time
  const rangeEndTime = (range.endTime ?? fallbackEnd) as Time

  return orderedEntries.map(([time, values]) => {
    const upper = values.upper as number
    const lower = values.lower as number
    return {
      time: time as Time,
      upper: Math.max(upper, lower),
      lower: Math.min(upper, lower),
      rangeStartTime,
      rangeEndTime,
    }
  })
}

function getPriceFormatter(ohlcData: LpPriceOhlcDataFormatted[]) {
  const min = Math.min(...ohlcData.map((x) => x.low))
  const max = Math.max(...ohlcData.map((x) => x.high))

  return {
    type: 'custom' as const,
    formatter: (price: number) => priceFormatter(price, max - min),
  }
}

type LiquidationRangeSeriesApi = ISeriesApi<
  'Custom',
  Time,
  LiquidationRangePoint | CustomSeriesWhitespaceData<Time>,
  LiquidationRangeSeriesOptions
>

type Props = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartHeight: number
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  timeOption: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapperRef: any
  colors: ChartColors
  refetchingCapped: boolean
  fetchMoreChartData: (lastFetchEndTime: number) => void
  lastFetchEndTime: number
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  latestOraclePrice?: string
}

export const CandleChart = ({
  hideCandleSeriesLabel,
  chartHeight,
  ohlcData,
  oraclePriceData,
  liquidationRange,
  timeOption,
  wrapperRef,
  colors,
  refetchingCapped,
  fetchMoreChartData,
  lastFetchEndTime,
  oraclePriceVisible,
  liqRangeCurrentVisible,
  liqRangeNewVisible,
  latestOraclePrice,
}: Props) => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef<IChartApi>(null)

  const newRangeSeriesRef = useRef<LiquidationRangeSeriesApi | null>(null)
  const currentRangeSeriesRef = useRef<LiquidationRangeSeriesApi | null>(null)
  const currentRangePriceLinesRef = useRef<{ top: IPriceLine | null; bottom: IPriceLine | null }>({
    top: null,
    bottom: null,
  })
  const newRangePriceLinesRef = useRef<{ top: IPriceLine | null; bottom: IPriceLine | null }>({
    top: null,
    bottom: null,
  })
  const historicalRangeSeriesRefs = useRef<LiquidationRangeSeriesApi[]>([])
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const oraclePriceSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const lastFetchEndTimeRef = useRef(lastFetchEndTime)
  const ohlcDataRef = useRef(ohlcData)

  const isMounted = useRef(true)

  const [isUnmounting, setIsUnmounting] = useState(false)
  const [lastTimescale, setLastTimescale] = useState<{ from: Time; to: Time } | null>(null)
  const [wrapperDimensions, setWrapperDimensions] = useState({ width: 0, height: 0 })
  const fetchingMoreRef = useRef(false)

  // Memoize colors to prevent unnecessary re-renders
  const memoizedColors = useMemo(() => colors, [colors])

  // Central palette helper so every series gets the right colors immediately
  const getSeriesAppearance = useCallback(
    (variant: 'current' | 'new' | 'historical') => {
      if (variant === 'current') {
        return {
          seriesOptions: {
            fillColor: memoizedColors.rangeBackground,
            fillOpacity: 1,
            topLineColor: memoizedColors.rangeLineTop,
            bottomLineColor: memoizedColors.rangeLineBottom,
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            showTopLine: false,
            showBottomLine: false,
          },
          priceLineColorTop: memoizedColors.rangeLineTop,
          priceLineColorBottom: memoizedColors.rangeLineBottom,
        }
      }

      if (variant === 'new') {
        return {
          seriesOptions: {
            fillColor: memoizedColors.rangeBackgroundFuture,
            fillOpacity: 1,
            topLineColor: memoizedColors.rangeLineFutureTop,
            bottomLineColor: memoizedColors.rangeLineFutureBottom,
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            showTopLine: false,
            showBottomLine: false,
          },
          priceLineColorTop: memoizedColors.rangeLineFutureTop,
          priceLineColorBottom: memoizedColors.rangeLineFutureBottom,
        }
      }

      return {
        seriesOptions: {
          fillColor: memoizedColors.rangeBackground,
          fillOpacity: 1,
          topLineColor: memoizedColors.rangeLineBottom,
          bottomLineColor: memoizedColors.rangeLineBottom,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          showTopLine: true,
          showBottomLine: true,
        },
      }
    },
    [
      memoizedColors.rangeBackground,
      memoizedColors.rangeBackgroundFuture,
      memoizedColors.rangeLineBottom,
      memoizedColors.rangeLineFutureBottom,
      memoizedColors.rangeLineFutureTop,
      memoizedColors.rangeLineTop,
    ],
  )

  // Debounced update of wrapper dimensions
  const debouncedUpdateDimensions = useRef(
    lodash.debounce(() => {
      if (wrapperRef.current) {
        setWrapperDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight,
        })
      }
    }, 16), // ~60fps
  )

  // Update wrapper dimensions when wrapperRef changes
  useEffect(() => {
    debouncedUpdateDimensions.current()
  }, [wrapperRef])

  // Memoized visible range change handler
  const handleVisibleLogicalRangeChange = useCallback(() => {
    if (fetchingMoreRef.current || refetchingCapped || !chartRef.current || !candlestickSeriesRef.current) {
      return
    }

    const timeScale = chartRef.current.timeScale()
    const logicalRange = timeScale.getVisibleLogicalRange()

    if (!logicalRange) {
      return
    }

    const barsInfo = candlestickSeriesRef.current.barsInLogicalRange(logicalRange)
    if (barsInfo && barsInfo.barsBefore < 50) {
      void debouncedFetchMoreChartData.current()
      setLastTimescale(timeScale.getVisibleRange())
    }
  }, [refetchingCapped])

  useEffect(() => {
    lastFetchEndTimeRef.current = lastFetchEndTime
    // Reset fetching flag when new data arrives (fetch completed)
    fetchingMoreRef.current = false
  }, [lastFetchEndTime])

  // Keep ohlcDataRef in sync with latest ohlcData
  useEffect(() => {
    ohlcDataRef.current = ohlcData
  }, [ohlcData])

  const debouncedFetchMoreChartData = useRef(
    lodash.debounce(
      () => {
        // Check current state at execution time using ref
        if (fetchingMoreRef.current || refetchingCapped) {
          return
        }
        fetchingMoreRef.current = true
        fetchMoreChartData(lastFetchEndTimeRef.current)
      },
      500,
      { leading: true, trailing: false },
    ),
  )

  // Chart initialization effect - only run once. Keep variables out of the dependencies array.
  useEffect(() => {
    if (!chartContainerRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      timeScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        autoScale: true,
        alignLabels: true,
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    })
    chartRef.current.timeScale()
    isMounted.current = true

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [])

  // Update chart colors when they change
  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: memoizedColors.backgroundColor },
        textColor: memoizedColors.textColor,
      },
      grid: {
        vertLines: {
          color: memoizedColors.gridLine,
        },
        horzLines: {
          color: memoizedColors.gridLine,
        },
      },
    })
  }, [memoizedColors.backgroundColor, memoizedColors.textColor, memoizedColors.gridLine])

  // Update chart dimensions when they change
  useEffect(() => {
    if (!chartRef.current || wrapperDimensions.width <= 0) return

    const width = Math.max(1, wrapperDimensions.width)

    chartRef.current.applyOptions({
      width,
      height: chartHeight,
    })
  }, [chartHeight, wrapperDimensions.width])

  // Update timeScale visibility when timeOption changes
  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: timeOption !== 'day',
      },
    })
  }, [timeOption])

  // Update crosshair settings when colors change
  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      crosshair: {
        vertLine: {
          width: 4 as LineWidth,
          color: '#C3BCDB44',
          style: LineStyle.Solid,
          labelBackgroundColor: memoizedColors.cursorLabel,
        },
        horzLine: {
          color: memoizedColors.cursorLabel,
          labelBackgroundColor: memoizedColors.cursorLabel,
          style: LineStyle.Dashed,
        },
      },
    })
  }, [memoizedColors.cursorLabel, memoizedColors.cursorVertLine])

  // Liquidation range series effect - create/destroy series based on visibility
  useEffect(() => {
    if (!chartRef.current) return

    const configs = [
      { ref: currentRangeSeriesRef, priceLinesRef: currentRangePriceLinesRef, visible: liqRangeCurrentVisible },
      { ref: newRangeSeriesRef, priceLinesRef: newRangePriceLinesRef, visible: liqRangeNewVisible },
    ]

    const removePrimarySeries = () => {
      configs.forEach(({ ref, priceLinesRef }) => {
        if (ref.current) {
          chartRef.current?.removeSeries(ref.current)
          ref.current = null
        }
        priceLinesRef.current = { top: null, bottom: null }
      })
    }

    const removeHistoricalSeries = () => {
      historicalRangeSeriesRefs.current.forEach((series) => {
        if (series) {
          chartRef.current?.removeSeries(series)
        }
      })
      historicalRangeSeriesRefs.current = []
    }

    removePrimarySeries()
    removeHistoricalSeries()

    configs.forEach(({ ref, priceLinesRef, visible }, index) => {
      if (!visible || !chartRef.current) return

      const series = chartRef.current.addCustomSeries(createLiquidationRangeSeries(), {
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
      })

      ref.current = series
      const variant = index === 0 ? 'current' : 'new'
      const appearance = getSeriesAppearance(variant)
      series.applyOptions(appearance.seriesOptions)
      priceLinesRef.current = {
        top: series.createPriceLine({
          price: 0,
          color: appearance.priceLineColorTop,
          lineWidth: 2,
          lineStyle: LineStyle.LargeDashed,
          axisLabelVisible: true,
        }),
        bottom: series.createPriceLine({
          price: 0,
          color: appearance.priceLineColorBottom,
          lineWidth: 2,
          lineStyle: LineStyle.LargeDashed,
          axisLabelVisible: true,
        }),
      }
    })

    // create passive bands for historical ranges if provided
    const historicalRanges = liquidationRange?.historical ?? []
    historicalRanges.forEach(() => {
      if (!chartRef.current) return
      const series = chartRef.current.addCustomSeries(createLiquidationRangeSeries(), {
        lineWidth: 2,
        lineStyle: LineStyle.LargeDashed,
      })
      series.applyOptions(getSeriesAppearance('historical').seriesOptions)
      historicalRangeSeriesRefs.current.push(series)
    })

    return () => {
      removePrimarySeries()
      removeHistoricalSeries()
    }
  }, [liqRangeCurrentVisible, liqRangeNewVisible, liquidationRange, getSeriesAppearance])

  // OHLC series effect - only create once when chart is ready
  useEffect(() => {
    if (!chartRef.current || candlestickSeriesRef.current) return

    candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      priceLineStyle: LineStyle.LargeDashed,
      priceLineVisible: !hideCandleSeriesLabel,
      upColor: memoizedColors.green,
      downColor: memoizedColors.red,
      borderVisible: false,
      wickUpColor: memoizedColors.green,
      wickDownColor: memoizedColors.red,
      lastValueVisible: !hideCandleSeriesLabel,
      autoscaleInfoProvider: (original: () => { priceRange: { minValue: number; maxValue: number } | null } | null) => {
        const originalRange = original()

        if (!originalRange || !chartRef.current || !candlestickSeriesRef.current) {
          return originalRange
        }

        // Get visible logical range to determine which bars are visible
        const visibleLogicalRange = chartRef.current.timeScale().getVisibleLogicalRange()

        if (!visibleLogicalRange) {
          return originalRange
        }

        // Get the bars that are currently visible
        const barsInfo = candlestickSeriesRef.current.barsInLogicalRange(visibleLogicalRange)

        // Use ref to access latest ohlcData without causing series recreation
        const currentOhlcData = ohlcDataRef.current

        if (!barsInfo || !currentOhlcData || currentOhlcData.length === 0) {
          return originalRange
        }

        // Calculate the slice indices for visible bars
        const startIndex = Math.max(0, Math.floor(barsInfo.barsBefore))
        const endIndex = Math.min(currentOhlcData.length, currentOhlcData.length - Math.floor(barsInfo.barsAfter))

        // Get visible bars
        const visibleBars = currentOhlcData.slice(startIndex, endIndex)

        if (visibleBars.length === 0) {
          return originalRange
        }

        // Collect all price points (high and low) from visible bars
        const allPrices = visibleBars.flatMap((item) => [item.high, item.low])

        // Get the latest 5 candles to always include in range (current price action)
        const recentCandleCount = Math.min(5, visibleBars.length)
        const recentCandles = visibleBars.slice(-recentCandleCount)
        const recentPrices = recentCandles.flatMap((item) => [item.high, item.low])

        // Calculate robust price range excluding outliers but always including recent prices
        const robustRange = calculateRobustPriceRange(allPrices, recentPrices)

        // If we can't calculate a robust range, fall back to original auto-scaling
        if (!robustRange) {
          return originalRange
        }

        return {
          priceRange: robustRange,
        }
      },
    })

    return () => {
      candlestickSeriesRef.current = null
    }
  }, [hideCandleSeriesLabel, memoizedColors.green, memoizedColors.red])

  // Update candlestick colors when theme colors change
  useEffect(() => {
    if (!candlestickSeriesRef.current) return

    candlestickSeriesRef.current.applyOptions({
      upColor: memoizedColors.green,
      downColor: memoizedColors.red,
      wickUpColor: memoizedColors.green,
      wickDownColor: memoizedColors.red,
    })
  }, [memoizedColors.green, memoizedColors.red])

  // Oracle price series effect - only create once when chart is ready
  useEffect(() => {
    if (!chartRef.current || oraclePriceSeriesRef.current) return

    oraclePriceSeriesRef.current = chartRef.current.addSeries(LineSeries, {
      lineWidth: 2 as LineWidth,
      priceLineStyle: LineStyle.Dashed,
      visible: false, // Default visibility, will be updated by separate effect
    })

    return () => {
      oraclePriceSeriesRef.current = null
    }
  }, [])

  // Update OHLC data and price formatting when it changes
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !ohlcData) return

    const priceFormat = getPriceFormatter(ohlcData)
    candlestickSeriesRef.current.setData(ohlcData)
    candlestickSeriesRef.current.applyOptions({ priceFormat })
    chartRef.current.applyOptions({ localization: { priceFormatter: priceFormat.formatter } })
  }, [ohlcData])

  // Update oracle price data when it changes
  useEffect(() => {
    if (!oraclePriceSeriesRef.current || !oraclePriceData) return

    oraclePriceSeriesRef.current.setData(oraclePriceData)
  }, [oraclePriceData])

  // Update oracle price series visibility and color when they change
  useEffect(() => {
    if (!oraclePriceSeriesRef.current) return

    oraclePriceSeriesRef.current.applyOptions({
      color: memoizedColors.oraclePrice,
      visible: oraclePriceVisible,
    })
  }, [memoizedColors.oraclePrice, oraclePriceVisible])

  // Event subscription effect
  useEffect(() => {
    if (!chartRef.current) return

    const timeScale = chartRef.current.timeScale()
    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)
    }
  }, [handleVisibleLogicalRangeChange])

  // Update liquidation range data when it changes
  useEffect(() => {
    const applyRangeData = (
      seriesRef: RefObject<LiquidationRangeSeriesApi | null>,
      priceLinesRef: RefObject<{ top: IPriceLine | null; bottom: IPriceLine | null }> | null,
      data: LiquidationRangePoint[],
    ) => {
      if (!seriesRef.current) return

      seriesRef.current.setData(data)
      if (!priceLinesRef) return

      const latestPoint = data[data.length - 1]
      if (!latestPoint) return

      priceLinesRef.current.top?.applyOptions({ price: latestPoint.upper })
      priceLinesRef.current.bottom?.applyOptions({ price: latestPoint.lower })
    }

    if (!liquidationRange || (!liquidationRange.current && !liquidationRange.new && !liquidationRange.historical)) {
      currentRangeSeriesRef.current?.setData([])
      newRangeSeriesRef.current?.setData([])
      historicalRangeSeriesRefs.current.forEach((series) => series?.setData([]))
      return
    }

    if (liquidationRange.current) {
      applyRangeData(
        currentRangeSeriesRef,
        currentRangePriceLinesRef,
        normalizeLiquidationRangePoints(liquidationRange.current),
      )
    } else {
      currentRangeSeriesRef.current?.setData([])
    }

    if (liquidationRange.new) {
      applyRangeData(newRangeSeriesRef, newRangePriceLinesRef, normalizeLiquidationRangePoints(liquidationRange.new))
    } else {
      newRangeSeriesRef.current?.setData([])
    }

    // keep historical series in sync with normalized data snapshots
    const historicalRanges = liquidationRange.historical ?? []
    historicalRangeSeriesRefs.current.forEach((series, index) => {
      if (!series) return
      const normalized = historicalRanges[index] ? normalizeLiquidationRangePoints(historicalRanges[index]) : []
      series.setData(normalized)
    })
  }, [liquidationRange, liquidationRange?.historical, liqRangeCurrentVisible, liqRangeNewVisible])

  // Update liquidation range series colors and price line styling
  useEffect(() => {
    const applySeriesOptions = (
      series: LiquidationRangeSeriesApi | null,
      options: Partial<LiquidationRangeSeriesOptions>,
    ) => {
      if (series) {
        series.applyOptions(options)
      }
    }

    if (liqRangeCurrentVisible) {
      const appearance = getSeriesAppearance('current')
      applySeriesOptions(currentRangeSeriesRef.current, appearance.seriesOptions)

      currentRangePriceLinesRef.current.top?.applyOptions({
        color: appearance.priceLineColorTop,
        lineStyle: LineStyle.Dashed,
      })
      currentRangePriceLinesRef.current.bottom?.applyOptions({
        color: appearance.priceLineColorBottom,
        lineStyle: LineStyle.Dashed,
      })
    }

    if (liqRangeNewVisible) {
      const appearance = getSeriesAppearance('new')
      applySeriesOptions(newRangeSeriesRef.current, appearance.seriesOptions)

      newRangePriceLinesRef.current.top?.applyOptions({
        color: appearance.priceLineColorTop,
        lineStyle: LineStyle.Dashed,
      })
      newRangePriceLinesRef.current.bottom?.applyOptions({
        color: appearance.priceLineColorBottom,
        lineStyle: LineStyle.Dashed,
      })
    }

    const historicalAppearance = getSeriesAppearance('historical')
    historicalRangeSeriesRefs.current.forEach((series) => {
      applySeriesOptions(series, historicalAppearance.seriesOptions)
    })
  }, [liqRangeCurrentVisible, liqRangeNewVisible, getSeriesAppearance, liquidationRange?.historical])

  // Update timescale when lastTimescale changes
  useEffect(() => {
    if (!chartRef.current || !lastTimescale) return

    const timeScale = chartRef.current.timeScale()
    timeScale.setVisibleRange(lastTimescale)
  }, [lastTimescale])

  // Update latest oracle price when it changes (comes from on chain to keep the last data point as up to date as possible)
  useEffect(() => {
    if (
      !latestOraclePrice ||
      !oraclePriceSeriesRef.current ||
      !oraclePriceData ||
      oraclePriceData[oraclePriceData.length - 1].value === +latestOraclePrice
    )
      return

    oraclePriceSeriesRef.current.update({
      time: oraclePriceData[oraclePriceData.length - 1].time,
      value: +latestOraclePrice,
    })
  }, [latestOraclePrice, oraclePriceData])

  // Set series order effect - ensure proper layering
  useEffect(() => {
    if (!chartRef.current) return

    let order = 0

    // Define series refs and their order based on liquidation range logic
    const getLiquidationRangeSeries = () => {
      if (!liquidationRange || !liquidationRange.current || !liquidationRange.new) {
        return [currentRangeSeriesRef.current, newRangeSeriesRef.current]
      }

      const currentBottom =
        liquidationRange.current.price2?.[0]?.value ?? liquidationRange.current.price1?.[0]?.value ?? 0
      const newBottom = liquidationRange.new.price2?.[0]?.value ?? liquidationRange.new.price1?.[0]?.value ?? 0

      const addNewFirst = newBottom < currentBottom

      return addNewFirst
        ? [newRangeSeriesRef.current, currentRangeSeriesRef.current]
        : [currentRangeSeriesRef.current, newRangeSeriesRef.current]
    }

    // Define all series in order: liquidation ranges, volume, OHLC, oracle price
    const allSeries = [
      ...historicalRangeSeriesRefs.current,
      ...getLiquidationRangeSeries(),
      // volumeSeriesRef.current,
      candlestickSeriesRef.current,
      oraclePriceSeriesRef.current,
    ]

    // Set order for all series that exist
    allSeries.forEach((series) => {
      if (series) {
        series.setSeriesOrder(order++)
      }
    })
  }, [liquidationRange, liquidationRange?.historical, liqRangeCurrentVisible, liqRangeNewVisible])

  useEffect(() => {
    wrapperRef.current = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (isUnmounting) return

      const { width, height } = entries[0].contentRect
      if (width <= 0) return

      const adjustedWidth = Math.max(1, width - 1) // Ensure width is at least 1
      const adjustedHeight = Math.max(1, height) // Ensure height is at least 1

      // Update state with new dimensions (debounced)
      setWrapperDimensions({ width: adjustedWidth, height: adjustedHeight })

      // Apply dimensions immediately for smooth resizing
      chartRef.current?.applyOptions({ width: adjustedWidth, height: adjustedHeight })
      chartRef.current?.timeScale().getVisibleLogicalRange()
    })

    wrapperRef.current.observe(chartContainerRef.current)

    const debouncedUpdate = debouncedUpdateDimensions.current

    return () => {
      setIsUnmounting(true)
      debouncedUpdate.cancel()

      if (wrapperRef?.current) wrapperRef.current.disconnect()
    }
  }, [wrapperRef, isUnmounting])

  return <Container ref={chartContainerRef} />
}

const Container = styled.div`
  position: absolute;
  width: 100%;
  font-variant-numeric: tabular-nums;
`
