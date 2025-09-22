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
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
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
 * Creates a price formatter configuration for Lightweight Charts
 * @param totalDecimalPlacesRef - A ref to track the total decimal places for consistent formatting
 * @returns Price format configuration object
 */
function createPriceFormatter(totalDecimalPlacesRef: React.MutableRefObject<number>) {
  return {
    type: 'custom' as const,
    formatter: (price: any) => {
      const [, fraction] = price.toString().split('.')

      if (!fraction) {
        return price.toFixed(4)
      }

      const nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')

      // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
      // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
      totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

      return price.toFixed(totalDecimalPlacesRef.current)
    },
    minMove: 0.0000001,
  }
}

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

  // Memoize colors to prevent unnecessary re-renders
  const memoizedColors = useMemo(() => colors, [colors])

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

  // Initialize chart dimensions after creation
  useEffect(() => {
    if (!chartRef.current || !wrapperRef.current) return

    // Use a small delay to ensure the chart is fully initialized
    const timeoutId = setTimeout(() => {
      if (chartRef.current && wrapperRef.current) {
        chartRef.current.applyOptions({
          width: wrapperRef.current.clientWidth,
          height: chartExpanded ? chartHeight.expanded : chartHeight.standard,
        })
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [chartExpanded, chartHeight.expanded, chartHeight.standard, wrapperRef])

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
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      width: wrapperRef.current.clientWidth,
      height: chartExpanded ? chartHeight.expanded : chartHeight.standard,
    })
  }, [chartExpanded, chartHeight.expanded, chartHeight.standard, wrapperRef])

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

    // both ranges
    if (liquidationRange.current && liquidationRange.new) {
      const addNewFirst = liquidationRange.new.price2[0].value > liquidationRange.current.price2[0].value

      if (addNewFirst) {
        if (newAreaSeriesRef.current) {
          newAreaSeriesRef.current.setData(liquidationRange.new.price1)
        }
        if (newAreaBgSeriesRef.current) {
          newAreaBgSeriesRef.current.setData(liquidationRange.new.price2)
        }
        if (currentAreaSeriesRef.current) {
          currentAreaSeriesRef.current.setData(liquidationRange.current.price1)
        }
        if (currentAreaBgSeriesRef.current) {
          currentAreaBgSeriesRef.current.setData(liquidationRange.current.price2)
        }
      } else {
        if (currentAreaSeriesRef.current) {
          currentAreaSeriesRef.current.setData(liquidationRange.current.price1)
        }
        if (currentAreaBgSeriesRef.current) {
          currentAreaBgSeriesRef.current.setData(liquidationRange.current.price2)
        }
        if (newAreaSeriesRef.current) {
          newAreaSeriesRef.current.setData(liquidationRange.new.price1)
        }
        if (newAreaBgSeriesRef.current) {
          newAreaBgSeriesRef.current.setData(liquidationRange.new.price2)
        }
      }
    }
    // only new
    else if (!liquidationRange.current && liquidationRange.new) {
      if (newAreaSeriesRef.current) {
        newAreaSeriesRef.current.setData(liquidationRange.new.price1)
      }
      if (newAreaBgSeriesRef.current) {
        newAreaBgSeriesRef.current.setData(liquidationRange.new.price2)
      }
    }
    // only current
    else if (liquidationRange.current && !liquidationRange.new) {
      if (currentAreaBgSeriesRef.current) {
        currentAreaBgSeriesRef.current.setData(liquidationRange.current.price2)
      }
      if (currentAreaSeriesRef.current) {
        currentAreaSeriesRef.current.setData(liquidationRange.current.price1)
      }
    }
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
    // Update current range series if they exist and are visible
    if (liqRangeCurrentVisible && currentAreaSeriesRef.current) {
      currentAreaSeriesRef.current.applyOptions({
        topColor: memoizedColors.rangeColorA25,
        bottomColor: memoizedColors.rangeColorA25,
        lineColor: memoizedColors.rangeColor,
      })
    }
    if (liqRangeCurrentVisible && currentAreaBgSeriesRef.current) {
      currentAreaBgSeriesRef.current.applyOptions({
        topColor: memoizedColors.backgroundColor,
        bottomColor: memoizedColors.backgroundColor,
        lineColor: memoizedColors.rangeColor,
      })
    }

    // Update new range series if they exist and are visible
    if (liqRangeNewVisible && newAreaSeriesRef.current) {
      newAreaSeriesRef.current.applyOptions({
        topColor: memoizedColors.rangeColorA25,
        bottomColor: memoizedColors.rangeColorA25,
        lineColor: memoizedColors.rangeColor,
      })
    }
    if (liqRangeNewVisible && newAreaBgSeriesRef.current) {
      newAreaBgSeriesRef.current.applyOptions({
        topColor: memoizedColors.backgroundColor,
        bottomColor: memoizedColors.backgroundColor,
        lineColor: memoizedColors.rangeColor,
      })
    }

    // Update "old" colors for current range if both current and new exist
    if (
      liqRangeCurrentVisible &&
      currentAreaSeriesRef.current &&
      currentAreaBgSeriesRef.current &&
      liquidationRange &&
      liquidationRange.current &&
      liquidationRange.new
    ) {
      currentAreaSeriesRef.current.applyOptions({
        topColor: memoizedColors.rangeColorA25Old,
        bottomColor: memoizedColors.rangeColorA25Old,
        lineColor: memoizedColors.rangeColorOld,
      })
      currentAreaBgSeriesRef.current.applyOptions({
        topColor: memoizedColors.backgroundColor,
        bottomColor: memoizedColors.backgroundColor,
        lineColor: memoizedColors.rangeColorOld,
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

    // Liquidation range series (behind OHLC)
    // Order should match the data setting logic
    if (liquidationRange && liquidationRange.current && liquidationRange.new) {
      const addNewFirst = liquidationRange.new.price2[0].value > liquidationRange.current.price2[0].value

      if (addNewFirst) {
        // New range first
        if (newAreaSeriesRef.current) {
          newAreaSeriesRef.current.setSeriesOrder(order++)
        }
        if (newAreaBgSeriesRef.current) {
          newAreaBgSeriesRef.current.setSeriesOrder(order++)
        }
        if (currentAreaSeriesRef.current) {
          currentAreaSeriesRef.current.setSeriesOrder(order++)
        }
        if (currentAreaBgSeriesRef.current) {
          currentAreaBgSeriesRef.current.setSeriesOrder(order++)
        }
      } else {
        // Current range first
        if (currentAreaSeriesRef.current) {
          currentAreaSeriesRef.current.setSeriesOrder(order++)
        }
        if (currentAreaBgSeriesRef.current) {
          currentAreaBgSeriesRef.current.setSeriesOrder(order++)
        }
        if (newAreaSeriesRef.current) {
          newAreaSeriesRef.current.setSeriesOrder(order++)
        }
        if (newAreaBgSeriesRef.current) {
          newAreaBgSeriesRef.current.setSeriesOrder(order++)
        }
      }
    } else {
      // Only one range or no ranges - use default order
      if (currentAreaSeriesRef.current) {
        currentAreaSeriesRef.current.setSeriesOrder(order++)
      }
      if (currentAreaBgSeriesRef.current) {
        currentAreaBgSeriesRef.current.setSeriesOrder(order++)
      }
      if (newAreaSeriesRef.current) {
        newAreaSeriesRef.current.setSeriesOrder(order++)
      }
      if (newAreaBgSeriesRef.current) {
        newAreaBgSeriesRef.current.setSeriesOrder(order++)
      }
    }

    // Volume series (bottom layer)
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setSeriesOrder(order++)
    }

    // OHLC series (main layer)
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setSeriesOrder(order++)
    }

    // Oracle price series (top layer)
    if (oraclePriceSeriesRef.current) {
      oraclePriceSeriesRef.current.setSeriesOrder(order++)
    }
  }, [liquidationRange])

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
