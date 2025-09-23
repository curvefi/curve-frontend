import type { IChartApi, Time, ISeriesApi, LineWidth } from 'lightweight-charts'
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
import { useEffect, useRef, useState, useCallback, useMemo, RefObject } from 'react'
import { styled } from 'styled-components'
import type {
  LpPriceOhlcDataFormatted,
  ChartHeight,
  VolumeData,
  OraclePriceData,
  LiquidationRanges,
  ChartColors,
} from './types'
import { hslaToRgb } from './utils'

/**
 * @param totalDecimalPlacesRef - A ref to track the total decimal places for consistent formatting
 * @returns Price format configuration object
 */
const createPriceFormatter = (totalDecimalPlacesRef: RefObject<number>) => ({
  type: 'custom' as const,
  formatter: (price: number) => {
    const [, fraction] = price.toString().split('.')

    if (!fraction) {
      return price.toFixed(4)
    }

    const nonZeroIndex = fraction.split('').findIndex((char: string) => char !== '0')

    // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
    // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
    totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

    return price.toFixed(totalDecimalPlacesRef.current)
  },
  minMove: 0.0000001,
})

/**
 * Shared configuration for liquidation range area series
 */
const SL_RANGE_AREA_SERIES_DEFAULTS = {
  lineWidth: 1 as LineWidth,
  lineStyle: 3,
  crosshairMarkerVisible: false,
  pointMarkersVisible: false,
  lineVisible: false,
  priceLineStyle: 2,
} as const

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
  const [lastTimescale, setLastTimescale] = useState<{ from: Time; to: Time } | null>(null)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [wrapperDimensions, setWrapperDimensions] = useState({ width: 0, height: 0 })

  // Memoize colors to prevent unnecessary re-renders
  const memoizedColors = useMemo(() => colors, [colors])

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
      debouncedFetchMoreChartData.current()
      setLastTimescale(timeScale.getVisibleRange())
    }
  }, [fetchingMore, refetchingCapped])

  useEffect(() => {
    lastFetchEndTimeRef.current = lastFetchEndTime
  }, [lastFetchEndTime])

  const debouncedFetchMoreChartData = useRef(
    lodash.debounce(
      () => {
        if (fetchingMore || refetchingCapped) {
          return
        }
        setFetchingMore(true)
        fetchMoreChartData(lastFetchEndTimeRef.current)
      },
      500,
      { leading: true, trailing: false },
    ),
  )

  // Chart initialization effect - only run once
  useEffect(() => {
    if (!chartContainerRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#000000',
      },
      timeScale: {
        timeVisible: true, // Default, will be updated by separate effect
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
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 4 as LineWidth,
          color: '#C3BCDB44',
          style: LineStyle.Solid,
          labelBackgroundColor: '#9B7DFF',
        },
        horzLine: {
          color: '#9B7DFF',
          labelBackgroundColor: '#9B7DFF',
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
        background: { type: ColorType.Solid, color: hslaToRgb(memoizedColors.backgroundColor) },
        textColor: hslaToRgb(memoizedColors.textColor),
      },
    })
  }, [memoizedColors.backgroundColor, memoizedColors.textColor])

  // Update chart dimensions when they change
  useEffect(() => {
    if (!chartRef.current || wrapperDimensions.width === 0) return

    chartRef.current.applyOptions({
      width: wrapperDimensions.width,
      height: chartExpanded ? chartHeight.expanded : chartHeight.standard,
    })
  }, [chartExpanded, chartHeight.expanded, chartHeight.standard, wrapperDimensions.width])

  // Update timeScale visibility when timeOption changes
  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: timeOption !== 'day',
      },
    })
  }, [timeOption])

  // Update crosshair settings when magnet changes
  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      crosshair: {
        mode: magnet ? CrosshairMode.Magnet : CrosshairMode.Normal,
        vertLine: {
          width: 4 as LineWidth,
          color: '#C3BCDB44',
          style: LineStyle.Solid,
          labelBackgroundColor: '#9B7DFF',
        },
        horzLine: {
          color: '#9B7DFF',
          labelBackgroundColor: '#9B7DFF',
        },
      },
    })
  }, [magnet])

  // Volume series effect - only create once when chart is ready
  useEffect(() => {
    if (!chartRef.current || volumeSeriesRef.current) return

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

    return () => {
      volumeSeriesRef.current = null
    }
  }, [])

  // Liquidation range series effect - create/destroy series based on visibility
  useEffect(() => {
    if (!chartRef.current) return

    // Clean up existing series first
    if (currentAreaSeriesRef.current) {
      chartRef.current.removeSeries(currentAreaSeriesRef.current)
      currentAreaSeriesRef.current = null
    }
    if (currentAreaBgSeriesRef.current) {
      chartRef.current.removeSeries(currentAreaBgSeriesRef.current)
      currentAreaBgSeriesRef.current = null
    }
    if (newAreaSeriesRef.current) {
      chartRef.current.removeSeries(newAreaSeriesRef.current)
      newAreaSeriesRef.current = null
    }
    if (newAreaBgSeriesRef.current) {
      chartRef.current.removeSeries(newAreaBgSeriesRef.current)
      newAreaBgSeriesRef.current = null
    }

    // Create current range series only if visible
    if (liqRangeCurrentVisible) {
      currentAreaSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
        ...SL_RANGE_AREA_SERIES_DEFAULTS,
        priceFormat: createPriceFormatter(totalDecimalPlacesRef),
      })
      currentAreaBgSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
        ...SL_RANGE_AREA_SERIES_DEFAULTS,
        priceFormat: createPriceFormatter(totalDecimalPlacesRef),
      })
    }

    // Create new range series only if visible
    if (liqRangeNewVisible) {
      newAreaSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
        ...SL_RANGE_AREA_SERIES_DEFAULTS,
        priceFormat: createPriceFormatter(totalDecimalPlacesRef),
      })
      newAreaBgSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
        ...SL_RANGE_AREA_SERIES_DEFAULTS,
        priceFormat: createPriceFormatter(totalDecimalPlacesRef),
      })
    }

    // Set data for newly created series if liquidation range data exists
    if (liquidationRange) {
      // both ranges
      if (liquidationRange.current && liquidationRange.new) {
        const addNewFirst = liquidationRange.new.price2[0].value > liquidationRange.current.price2[0].value

        if (addNewFirst) {
          if (newAreaSeriesRef.current) {
            newAreaSeriesRef.current.setData(liquidationRange.new.price2)
          }
          if (newAreaBgSeriesRef.current) {
            newAreaBgSeriesRef.current.setData(liquidationRange.new.price1)
          }
          if (currentAreaSeriesRef.current) {
            currentAreaSeriesRef.current.setData(liquidationRange.current.price2)
          }
          if (currentAreaBgSeriesRef.current) {
            currentAreaBgSeriesRef.current.setData(liquidationRange.current.price1)
          }
        } else {
          if (currentAreaSeriesRef.current) {
            currentAreaSeriesRef.current.setData(liquidationRange.current.price2)
          }
          if (currentAreaBgSeriesRef.current) {
            currentAreaBgSeriesRef.current.setData(liquidationRange.current.price1)
          }
          if (newAreaSeriesRef.current) {
            newAreaSeriesRef.current.setData(liquidationRange.new.price2)
          }
          if (newAreaBgSeriesRef.current) {
            newAreaBgSeriesRef.current.setData(liquidationRange.new.price1)
          }
        }
      }
      // only new
      else if (!liquidationRange.current && liquidationRange.new) {
        if (newAreaSeriesRef.current) {
          newAreaSeriesRef.current.setData(liquidationRange.new.price2)
        }
        if (newAreaBgSeriesRef.current) {
          newAreaBgSeriesRef.current.setData(liquidationRange.new.price1)
        }
      }
      // only current
      else if (liquidationRange.current && !liquidationRange.new) {
        if (currentAreaSeriesRef.current) {
          currentAreaSeriesRef.current.setData(liquidationRange.current.price2)
        }
        if (currentAreaBgSeriesRef.current) {
          currentAreaBgSeriesRef.current.setData(liquidationRange.current.price1)
        }
      }
    }

    return () => {
      if (currentAreaSeriesRef.current) {
        chartRef.current?.removeSeries(currentAreaSeriesRef.current)
        currentAreaSeriesRef.current = null
      }
      if (currentAreaBgSeriesRef.current) {
        chartRef.current?.removeSeries(currentAreaBgSeriesRef.current)
        currentAreaBgSeriesRef.current = null
      }
      if (newAreaSeriesRef.current) {
        chartRef.current?.removeSeries(newAreaSeriesRef.current)
        newAreaSeriesRef.current = null
      }
      if (newAreaBgSeriesRef.current) {
        chartRef.current?.removeSeries(newAreaBgSeriesRef.current)
        newAreaBgSeriesRef.current = null
      }
    }
  }, [liqRangeCurrentVisible, liqRangeNewVisible, liquidationRange])

  // OHLC series effect - only create once when chart is ready
  useEffect(() => {
    if (!chartRef.current || candlestickSeriesRef.current) return

    candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      priceLineStyle: 2,
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: createPriceFormatter(totalDecimalPlacesRef),
    })

    return () => {
      candlestickSeriesRef.current = null
    }
  }, [])

  // Oracle price series effect - only create once when chart is ready
  useEffect(() => {
    if (!chartRef.current || oraclePriceSeriesRef.current) return

    oraclePriceSeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#000000', // Default color, will be updated by separate effect
      lineWidth: 2 as LineWidth,
      priceLineStyle: 2,
      visible: false, // Default visibility, will be updated by separate effect
    })

    return () => {
      oraclePriceSeriesRef.current = null
    }
  }, [])

  // Update OHLC data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !ohlcData) return

    candlestickSeriesRef.current.setData(ohlcData)
  }, [ohlcData])

  // Update volume data when it changes
  useEffect(() => {
    if (!volumeSeriesRef.current || !volumeData) return

    volumeSeriesRef.current.setData(volumeData)
  }, [volumeData])

  // Update oracle price data when it changes
  useEffect(() => {
    if (!oraclePriceSeriesRef.current || !oraclePriceData) return

    oraclePriceSeriesRef.current.setData(oraclePriceData)
  }, [oraclePriceData])

  // Update oracle price series visibility and color when they change
  useEffect(() => {
    if (!oraclePriceSeriesRef.current) return

    oraclePriceSeriesRef.current.applyOptions({
      color: memoizedColors.chartOraclePrice,
      visible: oraclePriceVisible,
    })
  }, [memoizedColors.chartOraclePrice, oraclePriceVisible])

  // Event subscription effect
  useEffect(() => {
    if (!chartRef.current) return

    const timeScale = chartRef.current.timeScale()
    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)
    }
  }, [handleVisibleLogicalRangeChange])

  useEffect(() => {
    if (!volumeSeriesRef.current || !volumeData) return

    volumeSeriesRef.current.setData(volumeData)
  }, [volumeData])

  // Update liquidation range data when it changes
  useEffect(() => {
    if (!liquidationRange) return

    const setSeriesData = (series: ISeriesApi<'Area'> | null, data: any) => {
      if (series) series.setData(data)
    }

    const ranges = []
    if (liquidationRange.current && liquidationRange.new) {
      ranges.push(
        { series: newAreaSeriesRef.current, bgSeries: newAreaBgSeriesRef.current, data: liquidationRange.new },
        {
          series: currentAreaSeriesRef.current,
          bgSeries: currentAreaBgSeriesRef.current,
          data: liquidationRange.current,
        },
      )
    } else if (liquidationRange.new) {
      ranges.push({
        series: newAreaSeriesRef.current,
        bgSeries: newAreaBgSeriesRef.current,
        data: liquidationRange.new,
      })
    } else if (liquidationRange.current) {
      ranges.push({
        series: currentAreaSeriesRef.current,
        bgSeries: currentAreaBgSeriesRef.current,
        data: liquidationRange.current,
      })
    }

    // Set data for all ranges
    ranges.forEach(({ series, bgSeries, data }) => {
      setSeriesData(series, data.price1)
      setSeriesData(bgSeries, data.price2)
    })
  }, [liquidationRange])

  useEffect(() => {
    if (!candlestickSeriesRef.current || !ohlcData) return

    candlestickSeriesRef.current.setData(ohlcData)
    setFetchingMore(false)
  }, [ohlcData])

  useEffect(() => {
    if (!oraclePriceSeriesRef.current || !oraclePriceData) return

    oraclePriceSeriesRef.current.setData(oraclePriceData)
  }, [oraclePriceData])

  // Update liquidation range series colors when they change
  useEffect(() => {
    const applySeriesOptions = (
      series: ISeriesApi<'Area'> | null,
      colors: { top: string; bottom: string; line: string },
    ) => {
      if (series) {
        series.applyOptions({
          topColor: colors.top,
          bottomColor: colors.bottom,
          lineColor: colors.line,
        })
      }
    }

    const isBothRanges = liquidationRange?.current && liquidationRange?.new
    const currentColors = isBothRanges
      ? {
          top: memoizedColors.rangeColorA25Old,
          bottom: memoizedColors.backgroundColor,
          line: memoizedColors.rangeColorOld,
        }
      : { top: memoizedColors.rangeColorA25, bottom: memoizedColors.backgroundColor, line: memoizedColors.rangeColor }

    // Update current range series
    if (liqRangeCurrentVisible) {
      applySeriesOptions(currentAreaSeriesRef.current, currentColors)
      applySeriesOptions(currentAreaBgSeriesRef.current, { ...currentColors, top: currentColors.bottom })
    }

    // Update new range series
    if (liqRangeNewVisible) {
      applySeriesOptions(newAreaSeriesRef.current, {
        top: memoizedColors.rangeColorA25,
        bottom: memoizedColors.rangeColorA25,
        line: memoizedColors.rangeColor,
      })
      applySeriesOptions(newAreaBgSeriesRef.current, {
        top: memoizedColors.backgroundColor,
        bottom: memoizedColors.backgroundColor,
        line: memoizedColors.rangeColor,
      })
    }
  }, [
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    memoizedColors.rangeColorA25,
    memoizedColors.rangeColor,
    memoizedColors.backgroundColor,
    memoizedColors.rangeColorA25Old,
    memoizedColors.rangeColorOld,
    liquidationRange,
  ])

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
        // Only one range or no ranges - use default order
        return [
          currentAreaSeriesRef.current,
          currentAreaBgSeriesRef.current,
          newAreaSeriesRef.current,
          newAreaBgSeriesRef.current,
        ]
      }

      const addNewFirst = liquidationRange.new.price2[0].value > liquidationRange.current.price2[0].value

      if (addNewFirst) {
        // New range first
        return [
          newAreaSeriesRef.current,
          newAreaBgSeriesRef.current,
          currentAreaSeriesRef.current,
          currentAreaBgSeriesRef.current,
        ]
      } else {
        // Current range first
        return [
          currentAreaSeriesRef.current,
          currentAreaBgSeriesRef.current,
          newAreaSeriesRef.current,
          newAreaBgSeriesRef.current,
        ]
      }
    }

    // Define all series in order: liquidation ranges, volume, OHLC, oracle price
    const allSeries = [
      ...getLiquidationRangeSeries(),
      volumeSeriesRef.current,
      candlestickSeriesRef.current,
      oraclePriceSeriesRef.current,
    ]

    // Set order for all series that exist
    allSeries.forEach((series) => {
      if (series) {
        series.setSeriesOrder(order++)
      }
    })
  }, [liquidationRange])

  useEffect(() => {
    wrapperRef.current = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (isUnmounting) return

      const { width, height } = entries[0].contentRect
      if (width <= -1) return

      // Update state with new dimensions (debounced)
      setWrapperDimensions({ width: width - 1, height })

      // Apply dimensions immediately for smooth resizing
      chartRef.current?.applyOptions({ width: width - 1, height })
      chartRef.current?.timeScale().getVisibleLogicalRange()
    })

    wrapperRef.current.observe(chartContainerRef.current)

    const debouncedUpdate = debouncedUpdateDimensions.current

    return () => {
      setIsUnmounting(true)
      debouncedUpdate.cancel()

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
