import type { IChartApi, Time, ISeriesApi } from 'lightweight-charts'
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts'
import lodash from 'lodash'
import { useEffect, useRef, useState, useMemo } from 'react'
import { styled } from 'styled-components'
import { calculateSmartVisibleRange, shouldApplySmartScaling } from './outlierUtils'
import type {
  LpPriceOhlcDataFormatted,
  ChartHeight,
  VolumeData,
  OraclePriceData,
  LiquidationRanges,
  ChartColors,
} from './types'

/**
 * Converts an HSLA color string to RGB format
 * Lightweight Cahrts v5 adds support for HSLA, but until then we need to convert to RGB
 * @param hsla - HSLA color string (e.g. "hsla(230, 60%, 29%, 1)")
 * @returns RGB color string (e.g. "rgb(44, 57, 118)")
 * @example
 * hslaToRgb("hsla(230, 60%, 29%, 1)") // returns "rgb(44, 57, 118)"
 * hslaToRgb("hsl(230, 60%, 29%)") // returns "rgb(44, 57, 118)"
 */
function hslaToRgb(hsla: string) {
  return hsla.replace(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/, (_, h, s, l) => {
    const a = s / 100
    const b = l / 100
    const k = (n: number) => (n + h / 30) % 12
    const f = (n: number) => b - a * Math.min(b, 1 - b) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
    return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`
  })
}

type Props = {
  chartHeight: ChartHeight
  ohlcData: LpPriceOhlcDataFormatted[]
  volumeData?: VolumeData[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  timeOption: string
  wrapperRef: any
  chartExpanded?: boolean
  magnet: boolean
  colors: ChartColors
  refetchingCapped: boolean
  fetchMoreChartData: (lastFetchEndTime: number) => void
  lastFetchEndTime: number
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  latestOraclePrice?: string
}

const CandleChart = ({
  chartHeight,
  ohlcData,
  volumeData,
  oraclePriceData,
  liquidationRange,
  timeOption,
  wrapperRef,
  chartExpanded,
  magnet,
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

  const newAreaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const newAreaBgSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const currentAreaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const currentAreaBgSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const oraclePriceSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const lastFetchEndTimeRef = useRef(lastFetchEndTime)

  const isMounted = useRef(true)
  const totalDecimalPlacesRef = useRef(4)

  const [isUnmounting, setIsUnmounting] = useState(false)
  const [fetchingMore, setFetchingMore] = useState(false)
  const lastTimeOptionRef = useRef(timeOption)
  const lastTimescaleRef = useRef<{ from: Time; to: Time } | null>(null)

  useEffect(() => {
    lastFetchEndTimeRef.current = lastFetchEndTime
  }, [lastFetchEndTime])

  // Clear time position when time option changes (new data period)
  useEffect(() => {
    if (lastTimeOptionRef.current !== timeOption) {
      lastTimescaleRef.current = null // Clear saved time position for new time period
      lastTimeOptionRef.current = timeOption
    }
  }, [timeOption])

  const debouncedFetchMoreChartData = useRef(
    lodash.debounce(
      () => {
        if (fetchingMore || refetchingCapped) {
          return
        }
        // Use the actual oldest timestamp from current data instead of lastFetchEndTime
        const actualOldestTime = ohlcData && ohlcData.length > 0 ? ohlcData[0].time : lastFetchEndTimeRef.current
        setFetchingMore(true)

        try {
          const actualOldestTime = ohlcData && ohlcData.length > 0 ? ohlcData[0].time : lastFetchEndTimeRef.current
          fetchMoreChartData(actualOldestTime)
        } catch (error) {
          console.error('Error fetching more chart data:', error)
        }
      },
      500,
      { leading: true, trailing: false },
    ),
  )

  // Memoize chart configuration to avoid unnecessary recreations
  const chartConfig = useMemo(
    () => ({
      layout: {
        background: { type: ColorType.Solid, color: hslaToRgb(colors.backgroundColor) },
        textColor: hslaToRgb(colors.textColor),
      },
      width: 800, // Start with fixed width, resize observer will handle dynamic sizing
      height: chartExpanded ? chartHeight.expanded : chartHeight.standard,
      timeScale: {
        timeVisible: true, // Will be updated separately in useEffect
      },
      rightPriceScale: {
        autoScale: false,
        alignLabels: true,
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      crosshair: {
        mode: magnet ? CrosshairMode.Magnet : CrosshairMode.Normal,
        vertLine: {
          width: 4 as const,
          color: '#C3BCDB44',
          style: LineStyle.Solid,
          labelBackgroundColor: '#9B7DFF',
        },
        horzLine: {
          color: '#9B7DFF',
          labelBackgroundColor: '#9B7DFF',
        },
      },
    }),
    [chartExpanded, chartHeight.expanded, chartHeight.standard, colors.backgroundColor, colors.textColor, magnet],
  )

  // Chart initialization effect - only recreate chart when essential config changes
  useEffect(() => {
    if (!chartContainerRef.current || !wrapperRef.current) return
    chartRef.current = createChart(chartContainerRef.current, chartConfig)
    chartRef.current.timeScale()
    isMounted.current = true

    const timeScale = chartRef.current.timeScale()

    const handleVisibleLogicalRangeChange = () => {
      if (fetchingMore || refetchingCapped || !chartRef.current || !candlestickSeriesRef.current) {
        return
      }

      const timeScale = chartRef.current.timeScale()
      const logicalRange = timeScale.getVisibleLogicalRange()

      if (!logicalRange) {
        return
      }

      const barsInfo = candlestickSeriesRef.current.barsInLogicalRange(logicalRange)
      if (barsInfo && barsInfo.barsBefore < 50) {
        // Save current position BEFORE fetching more data
        const currentPosition = timeScale.getVisibleRange()
        lastTimescaleRef.current = currentPosition
        debouncedFetchMoreChartData.current()
      }
    }

    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
      newAreaSeriesRef.current = null
      newAreaBgSeriesRef.current = null
      currentAreaSeriesRef.current = null
      currentAreaBgSeriesRef.current = null
      candlestickSeriesRef.current = null
      volumeSeriesRef.current = null
      oraclePriceSeriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartConfig])

  // Update timeScale visibility when timeOption changes - without recreating chart
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().applyOptions({
        timeVisible: timeOption !== 'day',
      })
    }
  }, [timeOption])

  // Series initialization effect - create series when chart is ready
  useEffect(() => {
    if (!chartRef.current) return

    // liquidation range series
    const addCurrentSeries = () => {
      if (chartRef.current && !currentAreaSeriesRef.current && liquidationRange?.current) {
        currentAreaSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
          topColor: colors.rangeColorA25,
          bottomColor: colors.rangeColorA25,
          lineColor: colors.rangeColor,
          lineWidth: 1,
          lineStyle: 3,
          crosshairMarkerVisible: false,
          pointMarkersVisible: false,
          lineVisible: false,
          priceLineStyle: 2,
          visible: liqRangeCurrentVisible,
          priceFormat: {
            type: 'custom',
            formatter: (price: any) => {
              const [, fraction] = price.toString().split('.')
              if (!fraction) {
                return price.toFixed(4)
              }
              const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4
              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
        currentAreaBgSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
          topColor: colors.backgroundColor,
          bottomColor: colors.backgroundColor,
          lineColor: colors.rangeColor,
          lineWidth: 1,
          lineStyle: 3,
          crosshairMarkerVisible: false,
          pointMarkersVisible: false,
          lineVisible: false,
          priceLineStyle: 2,
          visible: liqRangeCurrentVisible,
          priceFormat: {
            type: 'custom',
            formatter: (price: any) => {
              const [, fraction] = price.toString().split('.')
              if (!fraction) {
                return price.toFixed(4)
              }
              const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4
              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
      }
    }

    const addNewSeries = () => {
      if (chartRef.current && !newAreaSeriesRef.current && liquidationRange?.new) {
        newAreaSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
          topColor: colors.rangeColorA25,
          bottomColor: colors.rangeColorA25,
          lineColor: colors.rangeColor,
          lineWidth: 1,
          lineStyle: 3,
          crosshairMarkerVisible: false,
          pointMarkersVisible: false,
          lineVisible: false,
          priceLineStyle: 2,
          visible: liqRangeNewVisible,
          priceFormat: {
            type: 'custom',
            formatter: (price: any) => {
              const [, fraction] = price.toString().split('.')
              if (!fraction) {
                return price.toFixed(4)
              }
              const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4
              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
        newAreaBgSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
          topColor: colors.backgroundColor,
          bottomColor: colors.backgroundColor,
          lineColor: colors.rangeColor,
          lineWidth: 1,
          lineStyle: 3,
          crosshairMarkerVisible: false,
          pointMarkersVisible: false,
          lineVisible: false,
          priceLineStyle: 2,
          visible: liqRangeNewVisible,
          priceFormat: {
            type: 'custom',
            formatter: (price: any) => {
              const [, fraction] = price.toString().split('.')
              if (!fraction) {
                return price.toFixed(4)
              }
              const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4
              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
      }
    }

    // both ranges
    if (liquidationRange && liquidationRange.current && liquidationRange.new) {
      const addNewFirst = liquidationRange.new.price2[0].value > liquidationRange.current.price2[0].value
      if (addNewFirst) {
        addNewSeries()
        addCurrentSeries()
      } else {
        addCurrentSeries()
        addNewSeries()
      }
    }
    // only new
    if (liquidationRange && !liquidationRange.current && liquidationRange.new) {
      addNewSeries()
    }
    // only current
    if (liquidationRange && liquidationRange.current && !liquidationRange.new) {
      addCurrentSeries()
    }

    // ohlc series - always create if we have data and chart
    if (!candlestickSeriesRef.current) {
      candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        priceLineStyle: 2,
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceFormat: {
          type: 'custom',
          formatter: (price: any) => {
            const [, fraction] = price.toString().split('.')
            if (!fraction) {
              return price.toFixed(4)
            }
            const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')
            totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4
            return price.toFixed(totalDecimalPlacesRef.current)
          },
          minMove: 0.0000001,
        },
      })
    }

    if (volumeData && !volumeSeriesRef.current) {
      volumeSeriesRef.current = chartRef.current.addSeries(HistogramSeries, {
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // set as an overlay by setting a blank priceScaleId
      })
      volumeSeriesRef.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      })
    }

    if (oraclePriceData && !oraclePriceSeriesRef.current) {
      oraclePriceSeriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: colors.chartOraclePrice,
        lineWidth: 2,
        priceLineStyle: 2,
        visible: oraclePriceVisible,
      })
    }
  }, [
    chartConfig,
    colors,
    liquidationRange,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    volumeData,
    oraclePriceData,
    oraclePriceVisible,
  ])

  // Data update effect - only update chart data when data actually changes
  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    if (!ohlcData) {
      return
    }

    // Ensure candlestick series exists before updating data
    if (!candlestickSeriesRef.current) {
      candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        priceLineStyle: 2,
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceFormat: {
          type: 'custom',
          formatter: (price: any) => {
            const [, fraction] = price.toString().split('.')
            if (!fraction) {
              return price.toFixed(4)
            }
            const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')
            totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4
            return price.toFixed(totalDecimalPlacesRef.current)
          },
          minMove: 0.0000001,
        },
      })
    }

    candlestickSeriesRef.current.setData(ohlcData)

    setFetchingMore(false)

    const timeScale = chartRef.current.timeScale()

    // Restore user's time position when loading historical data
    if (lastTimescaleRef.current) {
      timeScale.setVisibleRange(lastTimescaleRef.current)
      lastTimescaleRef.current = null
    }

    // Apply smart scaling to focus on main price range and avoid outliers
    // This works on the Y-axis (price) while position restoration works on X-axis (time)
    if (shouldApplySmartScaling(ohlcData)) {
      const smartRange = calculateSmartVisibleRange(ohlcData)
      if (smartRange && chartRef.current) {
        // Use a slight delay to ensure the chart is fully initialized
        setTimeout(() => {
          if (chartRef.current && isMounted.current) {
            chartRef.current.priceScale('right').setVisibleRange(smartRange)
          }
        }, 200)
      }
    }
  }, [ohlcData])

  // Volume data update effect
  useEffect(() => {
    if (volumeSeriesRef.current && volumeData !== undefined) {
      volumeSeriesRef.current.setData(volumeData)
    }
  }, [volumeData])

  // Oracle price data update effect
  useEffect(() => {
    if (oraclePriceSeriesRef.current && oraclePriceData !== undefined) {
      oraclePriceSeriesRef.current.setData(oraclePriceData)
    }
  }, [oraclePriceData])

  // Latest oracle price update effect
  useEffect(() => {
    if (
      latestOraclePrice &&
      oraclePriceSeriesRef.current &&
      oraclePriceData &&
      oraclePriceData.length > 0 &&
      oraclePriceData[oraclePriceData.length - 1].value !== +latestOraclePrice
    ) {
      oraclePriceSeriesRef.current.update({
        time: oraclePriceData[oraclePriceData.length - 1].time,
        value: +latestOraclePrice,
      })
    }
  }, [latestOraclePrice, oraclePriceData])

  // Liquidation range data update effect
  useEffect(() => {
    if (liquidationRange !== undefined) {
      if (liquidationRange.new && newAreaSeriesRef.current && newAreaBgSeriesRef.current) {
        newAreaSeriesRef.current.setData(liquidationRange.new.price1)
        newAreaBgSeriesRef.current.setData(liquidationRange.new.price2)
      }

      if (liquidationRange.current && currentAreaSeriesRef.current && currentAreaBgSeriesRef.current) {
        currentAreaSeriesRef.current.setData(liquidationRange.current.price1)
        currentAreaBgSeriesRef.current.setData(liquidationRange.current.price2)
      }

      // Update colors when both ranges are present
      if (
        currentAreaSeriesRef.current &&
        currentAreaBgSeriesRef.current &&
        liquidationRange.current &&
        liquidationRange.new
      ) {
        currentAreaSeriesRef.current.applyOptions({
          topColor: colors.rangeColorA25Old,
          bottomColor: colors.rangeColorA25Old,
          lineColor: colors.rangeColorOld,
        })
        currentAreaBgSeriesRef.current.applyOptions({
          topColor: colors.backgroundColor,
          bottomColor: colors.backgroundColor,
          lineColor: colors.rangeColorOld,
        })
      }
    }
  }, [liquidationRange, colors.backgroundColor, colors.rangeColorA25Old, colors.rangeColorOld])

  // Visibility updates effect - update series visibility without recreating chart
  useEffect(() => {
    if (currentAreaSeriesRef.current && currentAreaBgSeriesRef.current) {
      currentAreaSeriesRef.current.applyOptions({ visible: liqRangeCurrentVisible })
      currentAreaBgSeriesRef.current.applyOptions({ visible: liqRangeCurrentVisible })
    }
    if (newAreaSeriesRef.current && newAreaBgSeriesRef.current) {
      newAreaSeriesRef.current.applyOptions({ visible: liqRangeNewVisible })
      newAreaBgSeriesRef.current.applyOptions({ visible: liqRangeNewVisible })
    }
    if (oraclePriceSeriesRef.current) {
      oraclePriceSeriesRef.current.applyOptions({ visible: oraclePriceVisible })
    }
  }, [liqRangeCurrentVisible, liqRangeNewVisible, oraclePriceVisible])

  useEffect(() => {
    wrapperRef.current = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (isUnmounting) return

      const { width, height } = entries[0].contentRect
      if (width <= -1) return

      chartRef.current?.applyOptions({ width: width - 1, height })
      chartRef.current?.timeScale().getVisibleLogicalRange()
    })

    wrapperRef.current.observe(chartContainerRef.current)

    return () => {
      setIsUnmounting(true)

      wrapperRef?.current && wrapperRef.current.disconnect()
    }
  }, [wrapperRef, isUnmounting])

  return <Container ref={chartContainerRef} />
}

const Container = styled.div`
  position: absolute;
  width: 100%;
  font-variant-numeric: tabular-nums;
`

export default CandleChart
