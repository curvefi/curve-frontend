import type {
  LpPriceOhlcDataFormatted,
  ChartType,
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

type Props = {
  chartType: ChartType
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
  refetchingHistory: boolean
  refetchingCapped: boolean
  lastRefetchLength: number
  fetchMoreChartData: () => void
}

const CandleChart = ({
  chartType,
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
  refetchingHistory,
  refetchingCapped,
  lastRefetchLength,
  fetchMoreChartData,
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

  const isMounted = useRef(true)
  const totalDecimalPlacesRef = useRef(4)

  const [isUnmounting, setIsUnmounting] = useState(false)
  const [lastTimescale, setLastTimescale] = useState<{ from: Time; to: Time } | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor },
        textColor: colors.textColor,
      },
      width: wrapperRef.current.clientWidth,
      height: chartExpanded ? chartHeight.expanded : chartHeight.standard,
      timeScale: {
        timeVisible: timeOption === 'day' ? false : true,
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
        })
      }
    }
    // new
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
            let [whole, fraction] = price.toString().split('.')

            if (!fraction) {
              return price.toFixed(4)
            }

            let nonZeroIndex = fraction.split('').findIndex((char: any) => char !== '0')

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
        // set the positioning of the volume series
        scaleMargins: {
          top: 0.7, // highest point of the series will be 70% away from the top
          bottom: 0,
        },
      })
    }

    if (oraclePriceData && !oraclePriceSeriesRef.current) {
      oraclePriceSeriesRef.current = chartRef.current.addLineSeries({
        color: colors.chartOraclePrice,
        lineWidth: 2,
        priceLineStyle: 2,
      })
    }

    return () => {
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
    liquidationRange,
    magnet,
    ohlcData,
    oraclePriceData,
    timeOption,
    volumeData,
    wrapperRef,
  ])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        crosshair: {
          mode: magnet ? CrosshairMode.Magnet : CrosshairMode.Normal,
        },
      })
    }
  }, [magnet])

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

    if (candlestickSeriesRef.current && chartRef.current) {
      candlestickSeriesRef.current.setData(ohlcData)

      const timeScale = chartRef.current.timeScale()

      if (lastTimescale) {
        timeScale.setVisibleRange(lastTimescale)
      }

      let timer: NodeJS.Timeout | null = null
      timeScale.subscribeVisibleLogicalRangeChange(() => {
        if (timer || refetchingHistory || refetchingCapped || lastRefetchLength === ohlcData.length) {
          return
        }
        timer = setTimeout(() => {
          const logicalRange = timeScale.getVisibleLogicalRange()
          if (
            logicalRange &&
            candlestickSeriesRef.current &&
            (!refetchingHistory || !refetchingCapped || lastRefetchLength !== ohlcData.length)
          ) {
            const barsInfo = candlestickSeriesRef.current.barsInLogicalRange(logicalRange)
            if (barsInfo && barsInfo.barsBefore < 50) {
              setLastTimescale(timeScale.getVisibleRange())
              fetchMoreChartData()
            }
          }
          timer = null
        }, 150)
      })
    }

    if (volumeSeriesRef.current && volumeData !== undefined) {
      volumeSeriesRef.current.setData(volumeData)
    }

    if (oraclePriceSeriesRef.current && oraclePriceData !== undefined) {
      oraclePriceSeriesRef.current.setData(oraclePriceData)
    }
  }, [
    colors.backgroundColor,
    colors.rangeColorA25Old,
    colors.rangeColorOld,
    fetchMoreChartData,
    lastRefetchLength,
    lastTimescale,
    liquidationRange,
    ohlcData,
    oraclePriceData,
    refetchingCapped,
    refetchingHistory,
    volumeData,
  ])

  useEffect(() => {
    wrapperRef.current = new ResizeObserver((entries) => {
      if (isUnmounting) return // Skip resizing if the component is unmounting

      let { width, height } = entries[0].contentRect
      width -= 1
      if (width <= 0) return // Skip resizing if the width is negative or zero

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
`

export default CandleChart
