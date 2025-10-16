import type { EChartsOption } from 'echarts-for-react'
import ReactECharts from 'echarts-for-react'
import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { Token } from '@/llamalend/features/borrow/types'
import { ChartDataPoint, BandsBalancesData } from '@/llamalend/widgets/bands-chart/types'
import { Box, Stack, useTheme } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { DesignSystem } from '@ui-kit/themes/design'

type BandsChartProps = {
  collateralToken?: Token
  borrowToken?: Token
  chartData: ChartDataPoint[]
  userBandsBalances: BandsBalancesData[]
  liquidationBand: number | null | undefined
  oraclePrice: string | undefined
  oraclePriceBand: number | null | undefined
  height?: number
}

export const BandsChart = ({
  collateralToken,
  borrowToken,
  chartData,
  userBandsBalances,
  liquidationBand,
  oraclePrice,
  oraclePriceBand,
  height = 500,
}: BandsChartProps) => {
  const theme = useTheme()
  const { theme: currentThemeName } = theme.design
  const invertedDesign = DesignSystem[currentThemeName]({ inverted: true })

  const backgroundColor = theme.design.Layer[1].Fill
  const textColor = theme.design.Text.TextColors.Primary
  const textColorInverted = invertedDesign.Text.TextColors.Primary
  const gridColor = theme.design.Color.Neutral[300]
  const marketBandColor = theme.design.Color.Neutral[300]
  const userBandColor = theme.design.Color.Neutral[500]
  const borderColor = theme.design.Layer[1].Outline
  const userRangeHighlightColor = theme.design.Color.Tertiary[200]
  const userRangeLabelBackgroundColor = theme.design.Color.Tertiary[300]
  const oraclePriceLineColor = theme.design.Color.Primary[500]
  const liquidationBandOutlineColor = theme.design.Color.Tertiary[600]

  const palette = useMemo(
    () => ({
      backgroundColor,
      textColor,
      textColorInverted,
      gridColor,
      marketBandColor,
      userBandColor,
      borderColor,
      userRangeHighlightColor,
      userRangeLabelBackgroundColor,
      oraclePriceLineColor,
      liquidationBandOutlineColor,
    }),
    [
      backgroundColor,
      textColor,
      textColorInverted,
      gridColor,
      marketBandColor,
      userBandColor,
      borderColor,
      userRangeHighlightColor,
      userRangeLabelBackgroundColor,
      oraclePriceLineColor,
      liquidationBandOutlineColor,
    ],
  )

  const defaultBrushWindow = 50

  const userBandsPriceRange = useMemo(() => {
    if (userBandsBalances.length === 0) return null

    const userBandNumbers = new Set(userBandsBalances.map((band) => String(band.n)))

    // Since chartData is sorted descending by price:
    // - First user band found = HIGHEST price user band
    // - Last user band found = LOWEST price user band
    const highestPriceUserBand = chartData.find((band) => userBandNumbers.has(String(band.n)))

    if (!highestPriceUserBand) return null

    let lowestPriceUserBand: ChartDataPoint | undefined
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (userBandNumbers.has(String(chartData[i].n))) {
        lowestPriceUserBand = chartData[i]
        break
      }
    }

    if (!lowestPriceUserBand) return null

    return {
      // Highest price in user's range (will appear at top of chart)
      upperBandPriceUp: highestPriceUserBand.p_up,
      upperBandMedianPrice: highestPriceUserBand.pUpDownMedian,
      // Lowest price in user's range (will appear at bottom of chart)
      lowerBandPriceDown: lowestPriceUserBand.p_down,
      lowerBandMedianPrice: lowestPriceUserBand.pUpDownMedian,
    }
  }, [userBandsBalances, chartData])

  // Precompute axis and series arrays in a single pass
  const derived = useMemo(() => {
    const len = chartData.length
    const yAxisData = new Array<number>(len)
    const marketData = new Array<number>(len)
    const userData = new Array<number>(len)
    const isLiquidation = new Array<boolean>(len)

    for (let i = 0; i < len; i++) {
      const d = chartData[i]
      yAxisData[i] = d.pUpDownMedian
      marketData[i] = d.bandCollateralValueUsd + d.bandBorrowedValueUsd
      userData[i] = d.userBandCollateralValueUsd + d.userBandBorrowedValueUsd
      isLiquidation[i] = d.isLiquidationBand === 'SL'
    }

    return { yAxisData, marketData, userData, isLiquidation }
  }, [chartData])

  // Helper finders, memoized
  const findBandIndexByPrice = useCallback(
    (price: number) => chartData.findIndex((d) => price >= d.p_down && price <= d.p_up),
    [chartData],
  )
  const findClosestBandIndex = useCallback(
    (price: number) => {
      let closestIdx = 0
      let minDiff = Math.abs(chartData[0].pUpDownMedian - price)
      for (let i = 1; i < chartData.length; i++) {
        const diff = Math.abs(chartData[i].pUpDownMedian - price)
        if (diff < minDiff) {
          minDiff = diff
          closestIdx = i
        }
      }
      return closestIdx
    },
    [chartData],
  )

  const hasBrush = chartData.length > defaultBrushWindow

  // Compute initial zoom indices:
  // - If user has a position: include entire user range AND the oracle price band
  // - If no user position: show the full range
  const initialZoomIndices = useMemo(() => {
    const len = chartData.length
    if (len === 0) return null

    const fullRange = { startIndex: 0, endIndex: len - 1 }

    if (userBandsBalances.length === 0) {
      return fullRange
    }

    // Determine indices covering user's band range
    const userBandNumbers = new Set(userBandsBalances.map((b) => String(b.n)))
    let minUserIdx = Number.POSITIVE_INFINITY
    let maxUserIdx = Number.NEGATIVE_INFINITY
    for (let i = 0; i < len; i++) {
      if (userBandNumbers.has(String(chartData[i].n))) {
        if (i < minUserIdx) minUserIdx = i
        if (i > maxUserIdx) maxUserIdx = i
      }
    }

    if (!Number.isFinite(minUserIdx) || !Number.isFinite(maxUserIdx)) {
      // Safety: if we couldn't map user's bands to chart data, show full range
      return fullRange
    }

    // Try to find oracle price band index
    let oracleIdx = chartData.findIndex((d) => d.isOraclePriceBand)
    if (oracleIdx === -1 && oraclePrice) {
      const target = Number(oraclePrice)
      if (!Number.isNaN(target) && len > 0) {
        let closestIdx = 0
        let minDiff = Math.abs(chartData[0].pUpDownMedian - target)
        for (let i = 1; i < len; i++) {
          const diff = Math.abs(chartData[i].pUpDownMedian - target)
          if (diff < minDiff) {
            minDiff = diff
            closestIdx = i
          }
        }
        oracleIdx = closestIdx
      }
    }

    let startIndex = minUserIdx
    let endIndex = maxUserIdx
    if (oracleIdx !== -1) {
      startIndex = Math.min(startIndex, oracleIdx)
      endIndex = Math.max(endIndex, oracleIdx)
    }

    // Add a padding of 2 bands as required
    const pad = 2
    startIndex = Math.max(0, startIndex - pad)
    endIndex = Math.min(len - 1, endIndex + pad)

    return { startIndex, endIndex }
  }, [chartData, userBandsBalances, oraclePrice])

  const option: EChartsOption = useMemo(() => {
    if (chartData.length === 0) return {}

    const markAreas: Array<{ yAxis: number }[]> = []
    if (userBandsPriceRange) {
      let upperIdx = findBandIndexByPrice(userBandsPriceRange.upperBandPriceUp)
      let lowerIdx = findBandIndexByPrice(userBandsPriceRange.lowerBandPriceDown)
      if (upperIdx === -1) upperIdx = findClosestBandIndex(userBandsPriceRange.upperBandPriceUp)
      if (lowerIdx === -1) lowerIdx = findClosestBandIndex(userBandsPriceRange.lowerBandPriceDown)
      if (upperIdx !== -1 && lowerIdx !== -1) {
        markAreas.push([{ yAxis: upperIdx }, { yAxis: lowerIdx }])
      }
    }

    const markLines: Array<{
      yAxis: number
      label: { formatter: string; position?: string }
      lineStyle: { color: string; type: string; width: number }
    }> = []

    if (userBandsPriceRange) {
      let lowerIdx = findBandIndexByPrice(userBandsPriceRange.lowerBandPriceDown)
      let upperIdx = findBandIndexByPrice(userBandsPriceRange.upperBandPriceUp)
      if (lowerIdx === -1) lowerIdx = findClosestBandIndex(userBandsPriceRange.lowerBandPriceDown)
      if (upperIdx === -1) upperIdx = findClosestBandIndex(userBandsPriceRange.upperBandPriceUp)

      if (lowerIdx !== -1) {
        markLines.push({
          yAxis: lowerIdx,
          label: {
            formatter: `$${formatNumber(userBandsPriceRange.lowerBandPriceDown, { notation: 'compact' })}`,
            position: 'insideEndTop',
          },
          lineStyle: {
            color: palette.userRangeLabelBackgroundColor,
            type: 'dashed',
            width: 2,
          },
        })
      }

      if (upperIdx !== -1) {
        markLines.push({
          yAxis: upperIdx,
          label: {
            formatter: `$${formatNumber(userBandsPriceRange.upperBandPriceUp, { notation: 'compact' })}`,
            position: 'insideEndTop',
          },
          lineStyle: {
            color: palette.userRangeLabelBackgroundColor,
            type: 'dashed',
            width: 2,
          },
        })
      }
    }

    if (oraclePrice) {
      let oracleIdx = findBandIndexByPrice(Number(oraclePrice))
      if (oracleIdx === -1) oracleIdx = findClosestBandIndex(Number(oraclePrice))

      if (oracleIdx !== -1) {
        markLines.push({
          yAxis: oracleIdx,
          label: {
            formatter: `$${formatNumber(oraclePrice, { notation: 'compact' })}`,
            position: 'insideEndTop',
          },
          lineStyle: {
            color: palette.oraclePriceLineColor,
            type: 'dashed',
            width: 2,
          },
        })
      }
    }

    const dataZoomWidth = 20

    return {
      backgroundColor: 'transparent',
      animation: false,
      grid: {
        left: 0,
        right: 20 + dataZoomWidth,
        top: 40,
        bottom: 40,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: palette.backgroundColor,
        borderColor: palette.borderColor,
        borderWidth: 1,
        textStyle: { color: palette.textColor, fontSize: 12 },
        confine: true,
        formatter: (params: unknown) => {
          if (!Array.isArray(params) || params.length === 0) return ''
          const dataIndex = (params[0] as Record<string, number>).dataIndex
          const data = chartData[dataIndex]
          if (!data) return ''

          const parts = [`<div style="font-weight: bold; margin-bottom: 6px; font-size: 13px;">Band ${data.n}</div>`]
          const hasMarketData = data.bandCollateralValueUsd > 0 || data.bandBorrowedValueUsd > 0
          if (hasMarketData) {
            parts.push(
              `<div style="margin-bottom: 4px;"><span style="display:inline-block;width:8px;height:8px;background:${palette.marketBandColor};margin-right:6px;"></span><strong>Market:</strong></div>`,
            )
            parts.push(
              `<div style="margin-left: 14px; font-size: 11px;">${collateralToken?.symbol ?? 'Collateral'}: $${formatNumber(data.bandCollateralValueUsd, { maximumFractionDigits: 2 })}</div>`,
            )
            parts.push(
              `<div style="margin-left: 14px; font-size: 11px; margin-bottom: 4px;">${borrowToken?.symbol ?? 'Borrowed'}: $${formatNumber(data.bandBorrowedValueUsd, { maximumFractionDigits: 2 })}</div>`,
            )
          }

          const hasUserData = data.userBandCollateralValueUsd > 0 || data.userBandBorrowedValueUsd > 0
          if (hasUserData) {
            parts.push(
              `<div style="margin-bottom: 4px;"><span style="display:inline-block;width:8px;height:8px;background:${palette.userBandColor};margin-right:6px;"></span><strong>User:</strong></div>`,
            )
            parts.push(
              `<div style="margin-left: 14px; font-size: 11px;">${collateralToken?.symbol ?? 'Collateral'}: $${formatNumber(data.userBandCollateralValueUsd, { maximumFractionDigits: 2 })}</div>`,
            )
            parts.push(
              `<div style="margin-left: 14px; font-size: 11px; margin-bottom: 4px;">${borrowToken?.symbol ?? 'Borrowed'}: $${formatNumber(data.userBandBorrowedValueUsd, { maximumFractionDigits: 2 })}</div>`,
            )
          }

          if (data.p_up) {
            parts.push(
              `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid ${palette.borderColor}; font-size: 11px; opacity: 0.8;">Price: $${formatNumber(data.p_down)} - $${formatNumber(data.p_up)}</div>`,
            )
          }

          return parts.join('')
        },
      },
      xAxis: {
        type: 'value',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: palette.gridColor,
          fontSize: 12,
          hideOverlap: true,
          interval: 'auto',
          margin: 8,
          formatter: (value: number) => `$${formatNumber(value, { notation: 'compact' })}`,
        },
        splitLine: {
          show: true,
          lineStyle: { color: palette.gridColor, opacity: 0.5, type: 'dashed' },
        },
      },
      yAxis: [
        {
          type: 'category',
          position: 'right',
          inverse: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: palette.gridColor,
            fontSize: 12,
            formatter: (value: number | string) => `$${formatNumber(Number(value), { notation: 'compact' })}`,
          },
          splitLine: { show: true, lineStyle: { color: palette.gridColor, opacity: 0.5, type: 'dashed' } },
          data: derived.yAxisData,
          boundaryGap: true,
        },
      ],
      series: [
        {
          name: 'Market Collateral',
          type: 'bar',
          stack: 'total',
          animation: false,
          progressive: 500,
          progressiveThreshold: 3000,
          progressiveChunkMode: 'mod',
          data: derived.marketData.map((value, index) => ({
            value,
            itemStyle: {
              color: palette.marketBandColor,
              borderColor: derived.isLiquidation[index] ? palette.liquidationBandOutlineColor : 'transparent',
              borderWidth: derived.isLiquidation[index] ? 2 : 0,
            },
          })),
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' },
          },
          animationDuration: 300,
          animationEasing: 'cubicOut',
          barCategoryGap: '20%',
          markArea:
            markAreas.length > 0
              ? { silent: true, itemStyle: { color: palette.userRangeHighlightColor }, data: markAreas }
              : undefined,
          markLine:
            markLines.length > 0
              ? {
                  silent: false,
                  symbol: 'none',
                  lineStyle: { width: 2 },
                  label: { position: 'insideEndTop', padding: [2, 4], fontSize: 12 },
                  data: markLines.map((line) => ({
                    ...line,
                    label: {
                      ...line.label,
                      backgroundColor:
                        line.lineStyle.color === palette.oraclePriceLineColor
                          ? palette.oraclePriceLineColor
                          : palette.userRangeLabelBackgroundColor,
                      color:
                        line.lineStyle.color === palette.oraclePriceLineColor
                          ? palette.textColorInverted
                          : palette.textColor,
                    },
                  })),
                }
              : undefined,
        },
        {
          name: 'User Collateral',
          type: 'bar',
          stack: 'total',
          animation: false,
          progressive: 500,
          progressiveThreshold: 3000,
          progressiveChunkMode: 'mod',
          data: derived.userData.map((value, index) => ({
            value,
            itemStyle: {
              color: palette.userBandColor,
              borderColor: derived.isLiquidation[index] ? palette.liquidationBandOutlineColor : 'transparent',
              borderWidth: derived.isLiquidation[index] ? 2 : 0,
            },
          })),
          emphasis: {
            focus: 'series',
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' },
          },
          animationDuration: 300,
          animationEasing: 'cubicOut',
          barCategoryGap: '20%',
        },
      ],
      dataZoom: hasBrush
        ? [
            {
              type: 'slider',
              yAxisIndex: 0,
              orient: 'vertical',
              right: 10,
              width: dataZoomWidth,
              brushSelect: false,
              showDataShadow: false,
              borderColor: palette.gridColor,
              fillerColor: 'rgba(128, 128, 128, 0.2)',
              handleSize: '80%',
              handleStyle: { color: palette.gridColor, borderColor: palette.gridColor },
              textStyle: { color: palette.gridColor, fontSize: 10 },
              labelFormatter: (value: number | string) => `$${formatNumber(Number(value), { notation: 'compact' })}`,
              dataBackground: {
                lineStyle: { color: palette.gridColor, opacity: 0.5 },
                areaStyle: { color: palette.gridColor, opacity: 0.2 },
              },
              zoomLock: false,
              moveOnMouseMove: true,
              moveOnMouseWheel: true,
              preventDefaultMouseMove: true,
            },
            { type: 'inside', yAxisIndex: 0, orient: 'vertical', zoomOnMouseWheel: 'shift', moveOnMouseWheel: true },
          ]
        : [],
    }
  }, [
    chartData,
    derived,
    hasBrush,
    userBandsPriceRange,
    oraclePrice,
    palette,
    collateralToken,
    borrowToken,
    findBandIndexByPrice,
    findClosestBandIndex,
  ])

  // Persist dataZoom (start/end) across renders
  const [zoom, setZoom] = useState<{ start?: number; end?: number }>({})
  const initializedZoomRef = useRef(false)
  const lastZoomRef = useRef<{ start?: number; end?: number }>({})
  useEffect(() => {
    if (!initializedZoomRef.current && chartData.length > 0 && initialZoomIndices) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      setZoom({ start, end })
      lastZoomRef.current = { start, end }
      initializedZoomRef.current = true
    }
  }, [chartData.length, initialZoomIndices])

  // If initial zoom happened before user data arrived (showing full range),
  // re-apply zoom once user range and/or oracle data are available.
  useEffect(() => {
    if (chartData.length === 0 || !initialZoomIndices) return
    const prev = lastZoomRef.current
    const isUninitialized = prev.start == null || prev.end == null
    const isFullRange =
      !isUninitialized &&
      prev.start !== undefined &&
      prev.end !== undefined &&
      prev.start <= 0.0001 &&
      prev.end >= 99.999
    // Only override if we are still at full-range default (or uninitialized)
    if (isUninitialized || isFullRange) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      // Avoid setting identical values to prevent loops
      if (prev.start !== start || prev.end !== end) {
        setZoom({ start, end })
        lastZoomRef.current = { start, end }
      }
    }
  }, [chartData.length, userBandsBalances.length, oraclePrice, initialZoomIndices])

  const onEvents = useMemo(
    () => ({
      dataZoom: (evt: any) => {
        const payload = Array.isArray(evt?.batch) && evt.batch.length ? evt.batch[0] : evt
        const s = payload?.start
        const e = payload?.end
        if (typeof s === 'number' && typeof e === 'number') {
          const prev = lastZoomRef.current
          if (prev.start !== s || prev.end !== e) {
            lastZoomRef.current = { start: s, end: e }
            setZoom({ start: s, end: e })
          }
        }
      },
    }),
    [],
  )

  const optionWithZoom: EChartsOption = useMemo(() => {
    if ((option as any).dataZoom && Array.isArray((option as any).dataZoom) && zoom) {
      const dz = (option as any).dataZoom.map((z: any) =>
        z.type === 'slider'
          ? {
              ...z,
              ...(zoom.start != null ? { start: zoom.start } : {}),
              ...(zoom.end != null ? { end: zoom.end } : {}),
            }
          : z,
      )
      return { ...option, dataZoom: dz }
    }
    return option
  }, [option, zoom])

  if (chartData.length === 0) {
    return (
      <Box sx={{ width: '100%', fontVariantNumeric: 'tabular-nums', height }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '14px',
            color: palette.textColor,
          }}
        >
          <SpinnerWrapper>
            <Spinner size={18} />
          </SpinnerWrapper>
        </Box>
      </Box>
    )
  }

  return (
    <Stack sx={{ position: 'relative', width: '100%', minHeight: `${height}px` }}>
      <Box sx={{ width: '100%', fontVariantNumeric: 'tabular-nums', height }}>
        <ReactECharts
          option={optionWithZoom}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={onEvents}
          lazyUpdate
        />
      </Box>
    </Stack>
  )
}
