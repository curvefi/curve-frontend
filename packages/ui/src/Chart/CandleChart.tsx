import type {
  LpPriceOhlcDataFormatted,
  ChartHeight,
  VolumeData,
  OraclePriceData,
  LiquidationRanges,
  ChartColors,
} from './types'
import type { IChartApi, Time, ISeriesApi } from 'lightweight-charts'
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { debounce } from 'lodash'

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
  const chartRef = useRef<IChartApi | null>(null)

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

  useEffect(() => {
    lastFetchEndTimeRef.current = lastFetchEndTime
  }, [lastFetchEndTime])

  const debouncedFetchMoreChartData = useRef(
    debounce(
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

  useEffect(() => {
    if (!chartContainerRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: hslaToRgb(colors.backgroundColor) },
        textColor: hslaToRgb(colors.textColor),
      },
      width: wrapperRef.current.clientWidth,
      height: chartExpanded ? chartHeight.expanded : chartHeight.standard,
      timeScale: {
        timeVisible: timeOption !== 'day',
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
        mode: magnet ? CrosshairMode.Magnet : CrosshairMode.Normal,
        vertLine: {
          width: 4,
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

    // liquidation range series
    const addCurrentSeries = () => {
      if (chartRef.current) {
        currentAreaSeriesRef.current = chartRef.current.addAreaSeries({
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

              // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
              // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
        currentAreaBgSeriesRef.current = chartRef.current.addAreaSeries({
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

              // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
              // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
      }
    }
    const addNewSeries = () => {
      if (chartRef.current) {
        newAreaSeriesRef.current = chartRef.current.addAreaSeries({
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

              // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
              // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
              totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

              return price.toFixed(totalDecimalPlacesRef.current)
            },
            minMove: 0.0000001,
          },
        })
        newAreaBgSeriesRef.current = chartRef.current.addAreaSeries({
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

              // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
              // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
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
    if (liquidationRange && !liquidationRange.current && liquidationRange.new && !newAreaSeriesRef.current) {
      addNewSeries()
    }
    // only current
    if (liquidationRange && liquidationRange.current && !liquidationRange.new && !currentAreaSeriesRef.current) {
      addCurrentSeries()
    }

    // ohlc series
    if (ohlcData && !candlestickSeriesRef.current) {
      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
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

            // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
            // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
            totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

            return price.toFixed(totalDecimalPlacesRef.current)
          },
          minMove: 0.0000001,
        },
      })
    }

    if (volumeData && !volumeSeriesRef.current) {
      volumeSeriesRef.current = chartRef.current.addHistogramSeries({
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
      oraclePriceSeriesRef.current = chartRef.current.addLineSeries({
        color: colors.chartOraclePrice,
        lineWidth: 2,
        priceLineStyle: 2,
        visible: oraclePriceVisible,
      })
    }

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
        debouncedFetchMoreChartData.current()

        setLastTimescale(timeScale.getVisibleRange())
      }
    }

    const timeScale = chartRef.current.timeScale()

    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

      candlestickSeriesRef.current = null

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
  }, [
    chartExpanded,
    chartHeight.expanded,
    chartHeight.standard,
    colors.backgroundColor,
    colors.chartOraclePrice,
    colors.rangeColor,
    colors.rangeColorA25,
    colors.textColor,
    fetchingMore,
    lastTimescale,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    liquidationRange,
    magnet,
    ohlcData,
    oraclePriceData,
    oraclePriceVisible,
    refetchingCapped,
    timeOption,
    volumeData,
    wrapperRef,
  ])

  useEffect(() => {
    if (!chartRef.current) return

    const timeScale = chartRef.current.timeScale()

    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(ohlcData)
      setFetchingMore(false)

      if (lastTimescale) {
        timeScale.setVisibleRange(lastTimescale)
      }
    }

    if (volumeSeriesRef.current && volumeData !== undefined) {
      volumeSeriesRef.current.setData(volumeData)
    }

    if (oraclePriceSeriesRef.current && oraclePriceData !== undefined) {
      oraclePriceSeriesRef.current.setData(oraclePriceData)
    }

    if (liquidationRange !== undefined) {
      if (liquidationRange.new && newAreaSeriesRef.current && newAreaBgSeriesRef.current) {
        newAreaSeriesRef.current.setData(liquidationRange.new.price1)
        newAreaBgSeriesRef.current.setData(liquidationRange.new.price2)
      }

      if (liquidationRange.current && currentAreaSeriesRef.current && currentAreaBgSeriesRef.current) {
        currentAreaSeriesRef.current.setData(liquidationRange.current.price1)
        currentAreaBgSeriesRef.current.setData(liquidationRange.current.price2)
      }
      if (
        currentAreaSeriesRef.current &&
        currentAreaBgSeriesRef.current &&
        liquidationRange &&
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
  }, [
    colors.backgroundColor,
    colors.rangeColorA25Old,
    colors.rangeColorOld,
    fetchMoreChartData,
    fetchingMore,
    lastTimescale,
    liquidationRange,
    ohlcData,
    oraclePriceData,
    refetchingCapped,
    volumeData,
  ])

  // update the latest data point to ensure the oracle price is current in case there hasn't been recent events in the pool
  useEffect(() => {
    if (latestOraclePrice && oraclePriceSeriesRef.current && oraclePriceData) {
      oraclePriceSeriesRef.current.update({
        time: oraclePriceData[oraclePriceData.length - 1].time,
        value: +latestOraclePrice,
      })
    }
  }, [latestOraclePrice, oraclePriceData])

  useEffect(() => {
    wrapperRef.current = new ResizeObserver((entries) => {
      if (isUnmounting) return

      let { width, height } = entries[0].contentRect
      width -= 1
      if (width <= 0) return

      chartRef.current?.applyOptions({ width, height })
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
