import type { IChartApi, Time, ISeriesApi, LineWidth, IPriceLine, CustomSeriesWhitespaceData } from 'lightweight-charts'
import { createChart, ColorType, LineStyle, CandlestickSeries, LineSeries } from 'lightweight-charts'
import { sortBy } from 'lodash'
import { useEffect, useRef, useCallback, useMemo, type RefObject } from 'react'
import { Box } from '@mui/material'
import { maybes } from '@primitives/objects.utils'
import { CHART_LINE_WIDTHS } from '@ui-kit/shared/ui/Chart/chart.utils'
import { useLatestValueRef } from '../../hooks/useLatestValueRef'
import { PRICE_SCALE_MARGINS } from './constants'
import { createLiquidationRangeSeries } from './custom-series/liquidationRangeSeries'
import type { LiquidationRangePoint, LiquidationRangeSeriesOptions } from './custom-series/liquidationRangeSeries'
import { useCandleTimeScaleSubscriptions } from './hooks/useCandleTimeScaleSubscriptions'
import type { ChartColors } from './hooks/useChartPalette'
import { useHistoricalChartPagination } from './hooks/useHistoricalChartPagination'
import { useInitialChartRightOffset } from './hooks/useInitialChartRightOffset'
import { useVisiblePriceRangeSync } from './hooks/useVisiblePriceRangeSync'
import type { LpPriceOhlcDataFormatted, OraclePriceData, LiquidationRanges, LlammaLiquididationRange } from './types'
import { calculateRobustPriceRange, priceFormatter } from './utils'

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

  const orderedPoints = sortBy(
    Array.from(
      pointMap,
      ([time, { upper, lower }]) =>
        maybes([upper, lower], (...points) => ({
          time,
          upper: Math.max(...points),
          lower: Math.min(...points),
        })) ?? null,
    ).filter(point => point !== null),
    point => point.time,
  )

  if (!orderedPoints.length) {
    return []
  }

  const fallbackStart = orderedPoints[0].time as Time
  const fallbackEnd = orderedPoints.at(-1)!.time as Time
  const rangeStartTime = range.startTime ?? fallbackStart
  const rangeEndTime = range.endTime ?? fallbackEnd

  return orderedPoints.map(point => ({
    ...point,
    time: point.time as Time,
    rangeStartTime,
    rangeEndTime,
  }))
}

function getPriceFormat(ohlcData: LpPriceOhlcDataFormatted[] | undefined) {
  const delta = ohlcData?.length ? Math.max(...ohlcData.map(x => x.high)) - Math.min(...ohlcData.map(x => x.low)) : 1

  return {
    type: 'custom' as const,
    formatter: (price: number) => priceFormatter(price, delta),
  }
}

type LiquidationRangeSeriesApi = ISeriesApi<
  'Custom',
  Time,
  LiquidationRangePoint | CustomSeriesWhitespaceData<Time>,
  LiquidationRangeSeriesOptions
>

const LIQUIDATION_RANGE_LINE_STYLE: LiquidationRangeSeriesOptions['lineStyle'] = LineStyle.Dashed

type Props = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartHeight: number
  ohlcData: LpPriceOhlcDataFormatted[] | undefined
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  timeOption: string
  colors: ChartColors
  fetchMoreChartData: () => Promise<unknown>
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  latestOraclePrice?: number
  onVisiblePriceRangeChange?: (min: number, max: number) => void
}

export const CandleChart = ({
  hideCandleSeriesLabel,
  chartHeight,
  ohlcData,
  oraclePriceData,
  liquidationRange,
  timeOption,
  colors,
  fetchMoreChartData,
  oraclePriceVisible,
  liqRangeCurrentVisible,
  liqRangeNewVisible,
  latestOraclePrice,
  onVisiblePriceRangeChange,
}: Props) => {
  /*
   * lightweight-charts is an imperative canvas charting library: createChart()
   * creates a chart instance, and every series/price line/subscription is a
   * mutable handle owned by that instance. React re-runs this component whenever
   * props or state change, so local variables would be lost between renders and
   * React state would cause render loops for objects React does not render.
   * Refs keep those chart handles stable while effects push new data/options
   * into the existing chart instead of recreating it or talking to stale handles.
   */
  const chartContainerRef = useRef<HTMLDivElement>(null)
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
  const historicalRangeSeriesRef = useRef<LiquidationRangeSeriesApi[]>([])
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const oraclePriceSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const ohlcDataRef = useLatestValueRef(ohlcData)

  const hasSeriesData = !!ohlcData?.length || (oraclePriceData?.length ?? 0) > 0
  const memoizedColors = useMemo(() => colors, [colors])

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
            lineStyle: LIQUIDATION_RANGE_LINE_STYLE,
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
            lineStyle: LIQUIDATION_RANGE_LINE_STYLE,
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
          lineStyle: LIQUIDATION_RANGE_LINE_STYLE,
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

  const { handleVisibleLogicalRangeChange, restoreVisibleRangeAfterDataUpdate } = useHistoricalChartPagination({
    candlestickSeriesRef,
    chartRef,
    fetchMoreChartData,
    ohlcData,
    oraclePriceData,
    oraclePriceSeriesRef,
  })

  // Chart initialization effect - only run once. Keep variables out of the dependencies array.
  useEffect(() => {
    if (!chartContainerRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      autoSize: true,
      hoveredSeriesOnTop: false,
      timeScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        autoScale: true,
        alignLabels: true,
        borderVisible: false,
        scaleMargins: PRICE_SCALE_MARGINS,
      },
    })
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
      historicalRangeSeriesRef.current.forEach(series => {
        if (series) {
          chartRef.current?.removeSeries(series)
        }
      })
      historicalRangeSeriesRef.current = []
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
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
        }),
        bottom: series.createPriceLine({
          price: 0,
          color: appearance.priceLineColorBottom,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
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
        lineStyle: LineStyle.Solid,
      })
      series.applyOptions(getSeriesAppearance('historical').seriesOptions)
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      historicalRangeSeriesRef.current.push(series)
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
        const allPrices = visibleBars.flatMap(item => [item.high, item.low])

        // Get the latest 5 candles to always include in range (current price action)
        const recentCandleCount = Math.min(5, visibleBars.length)
        const recentCandles = visibleBars.slice(-recentCandleCount)
        const recentPrices = recentCandles.flatMap(item => [item.high, item.low])

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
  }, [hideCandleSeriesLabel, memoizedColors.green, memoizedColors.red, ohlcDataRef])

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
      lineWidth: CHART_LINE_WIDTHS.referenceLine as LineWidth,
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

    const priceFormat = getPriceFormat(ohlcData)
    candlestickSeriesRef.current.setData(ohlcData)
    candlestickSeriesRef.current.applyOptions({ priceFormat })
    chartRef.current.applyOptions({ localization: { priceFormatter: priceFormat.formatter } })
    restoreVisibleRangeAfterDataUpdate()
  }, [ohlcData, restoreVisibleRangeAfterDataUpdate])

  useInitialChartRightOffset({ chartRef, hasSeriesData })

  // Update oracle price data when it changes
  useEffect(() => {
    if (!oraclePriceSeriesRef.current || !oraclePriceData) return

    oraclePriceSeriesRef.current.setData(oraclePriceData)
    // Oracle data drives historical pagination only for fallback-only charts.
    // In candle charts, candle updates restore the viewport; restoring here can
    // consume the pending range before the candle page arrives.
    const isOracleOnlyChart = ohlcData?.length === 0

    if (isOracleOnlyChart) {
      restoreVisibleRangeAfterDataUpdate()
    }
  }, [ohlcData?.length, oraclePriceData, restoreVisibleRangeAfterDataUpdate])

  // Update oracle price series visibility and color when they change
  useEffect(() => {
    if (!oraclePriceSeriesRef.current) return

    oraclePriceSeriesRef.current.applyOptions({
      color: memoizedColors.oraclePrice,
      visible: oraclePriceVisible,
    })
  }, [memoizedColors.oraclePrice, oraclePriceVisible])

  const { scheduleEmitPriceRange } = useVisiblePriceRangeSync({
    chartRef,
    chartContainerRef,
    onVisiblePriceRangeChange,
  })
  useCandleTimeScaleSubscriptions({
    chartRef,
    onVisibleLogicalRangeChange: handleVisibleLogicalRangeChange,
    enableVisiblePriceRangeSync: !!onVisiblePriceRangeChange,
    scheduleEmitPriceRange,
  })

  // Listen to series data updates to catch autoscale changes caused by setData/update.
  useEffect(() => {
    if (!onVisiblePriceRangeChange) return

    const watchedSeries = [
      candlestickSeriesRef.current,
      oraclePriceSeriesRef.current,
      currentRangeSeriesRef.current,
      newRangeSeriesRef.current,
      ...historicalRangeSeriesRef.current,
    ]

    watchedSeries.forEach(series => {
      series?.subscribeDataChanged(scheduleEmitPriceRange)
    })

    if (watchedSeries.length > 0) {
      scheduleEmitPriceRange()
    }

    return () => {
      watchedSeries.forEach(series => {
        series?.unsubscribeDataChanged(scheduleEmitPriceRange)
      })
    }
  }, [onVisiblePriceRangeChange, scheduleEmitPriceRange, liqRangeCurrentVisible, liqRangeNewVisible, liquidationRange])

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
      historicalRangeSeriesRef.current.forEach(series => series?.setData([]))
      scheduleEmitPriceRange()
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
    historicalRangeSeriesRef.current.forEach((series, index) => {
      if (!series) return
      const normalized = historicalRanges[index] ? normalizeLiquidationRangePoints(historicalRanges[index]) : []
      series.setData(normalized)
    })

    // Liquidation range data can expand the price scale — re-emit so the bands chart stays in sync.
    scheduleEmitPriceRange()
  }, [
    liquidationRange,
    liquidationRange?.historical,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    scheduleEmitPriceRange,
  ])

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
    historicalRangeSeriesRef.current.forEach(series => {
      applySeriesOptions(series, historicalAppearance.seriesOptions)
    })
  }, [liqRangeCurrentVisible, liqRangeNewVisible, getSeriesAppearance, liquidationRange?.historical])

  // Update latest oracle price when it changes (comes from on chain to keep the last data point as up to date as possible)
  useEffect(() => {
    if (
      latestOraclePrice == null ||
      !oraclePriceSeriesRef.current ||
      !oraclePriceData ||
      oraclePriceData[oraclePriceData.length - 1].value === latestOraclePrice
    )
      return

    oraclePriceSeriesRef.current.update({
      time: oraclePriceData[oraclePriceData.length - 1].time,
      value: latestOraclePrice,
    })
  }, [latestOraclePrice, oraclePriceData])

  // Set series order effect - ensure proper layering
  useEffect(() => {
    if (!chartRef.current) return

    let order = 0

    // Define all series in order (later = rendered on top): historical, current, new, OHLC, oracle
    const allSeries = [
      ...historicalRangeSeriesRef.current,
      currentRangeSeriesRef.current,
      newRangeSeriesRef.current,
      candlestickSeriesRef.current,
      oraclePriceSeriesRef.current,
    ]

    // Set order for all series that exist
    allSeries.forEach(series => {
      if (series) {
        series.setSeriesOrder(order++)
      }
    })
  }, [liquidationRange, liqRangeCurrentVisible, liqRangeNewVisible])

  return <Box sx={{ width: '100%', height: chartHeight, fontVariantNumeric: 'tabular-nums' }} ref={chartContainerRef} />
}
