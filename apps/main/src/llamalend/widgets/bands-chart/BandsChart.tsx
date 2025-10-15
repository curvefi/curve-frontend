import { useMemo, useState } from 'react'
import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  Cell,
} from 'recharts'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { Token } from '@/llamalend/features/borrow/types'
import { Box, Stack, useTheme } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { DesignSystem } from '@ui-kit/themes/design'

export type BandsBalancesData = {
  borrowed: string
  collateral: string
  collateralUsd: string
  collateralBorrowedUsd: number
  isLiquidationBand: string
  isOraclePriceBand: boolean
  isNGrouped: boolean
  n: number | string
  p_up: string
  p_down: string
  pUpDownMedian: string
}

type ChartDataPoint = {
  n: number | string
  pUpDownMedian: number
  p_up: number
  p_down: number
  marketCollateral: number
  userCollateral: number
  isLiquidationBand: string
  isOraclePriceBand: boolean
}

type BandsChartProps = {
  collateralToken?: Token
  borrowToken?: Token
  userBandsBalances: BandsBalancesData[]
  marketBandsBalances: BandsBalancesData[]
  liquidationBand: number | null | undefined
  oraclePrice: string | undefined
  oraclePriceBand: number | null | undefined
  height?: number
}

const CustomLabelWithBackground = ({
  value,
  viewBox,
  fill,
  backgroundColor,
}: {
  value: string
  viewBox?: { x: number; y: number; width: number }
  fill: string
  backgroundColor: string
}) => {
  if (!viewBox) return null

  const { x, y, width } = viewBox
  const textWidth = String(value).length * 6.5 + 8
  const textHeight = 18
  const rectX = x + width + 5
  const rectY = y - textHeight / 2
  const textX = rectX + 4
  const textY = y + 4

  return (
    <g>
      <rect x={rectX} y={rectY} width={textWidth} height={textHeight} fill={backgroundColor} />
      <text x={textX} y={textY} fill={fill} fontSize={12}>
        {value}
      </text>
    </g>
  )
}

export const BandsChart = ({
  collateralToken,
  borrowToken,
  userBandsBalances,
  marketBandsBalances,
  liquidationBand,
  oraclePrice,
  oraclePriceBand,
  height = 500,
}: BandsChartProps) => {
  // theming
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

  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined)
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined)

  const filteredMarketBandsBalances = useMemo(() => {
    if (!marketBandsBalances) return []

    const bandsWithOracle = marketBandsBalances.map((band) => ({
      ...band,
      isOraclePriceBand: Number(band.n) === oraclePriceBand,
    }))

    return _parseData(bandsWithOracle)
  }, [marketBandsBalances, oraclePriceBand])

  // Merge and sort data by n in ascending order, creating separate fields for market and user collateral
  const chartData = useMemo(() => {
    const bandsMap = new Map<string, ChartDataPoint>()

    // Add market bands
    filteredMarketBandsBalances.forEach((band) => {
      const key = String(band.n)
      bandsMap.set(key, {
        n: Number(band.n),
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        marketCollateral: band.collateralBorrowedUsd,
        userCollateral: 0,
        isLiquidationBand: band.isLiquidationBand,
        isOraclePriceBand: band.isOraclePriceBand,
      })
    })

    // Add user bands
    userBandsBalances.forEach((band) => {
      const key = String(band.n)
      const existing = bandsMap.get(key)
      if (existing) {
        existing.userCollateral = band.collateralBorrowedUsd
      } else {
        bandsMap.set(key, {
          n: Number(band.n),
          pUpDownMedian: Number(band.pUpDownMedian),
          p_up: Number(band.p_up),
          p_down: Number(band.p_down),
          marketCollateral: 0,
          userCollateral: band.collateralBorrowedUsd,
          isLiquidationBand: band.isLiquidationBand,
          isOraclePriceBand: band.isOraclePriceBand,
        })
      }
    })

    return Array.from(bandsMap.values()).sort((a, b) => Number(a.n) - Number(b.n))
  }, [userBandsBalances, filteredMarketBandsBalances])

  const defaultBrushWindow = 20

  const defaultStartIndex = useMemo(() => {
    if (userBandsBalances.length > 0) {
      // Get the range of user band numbers
      const { minUserBandNumber, maxUserBandNumber } = userBandsBalances.reduce(
        (acc, band) => {
          const n = Number(band.n)
          if (n < acc.minUserBandNumber) acc.minUserBandNumber = n
          if (n > acc.maxUserBandNumber) acc.maxUserBandNumber = n
          return acc
        },
        { minUserBandNumber: Infinity, maxUserBandNumber: -Infinity },
      )

      // Find the indices of these bands in the sorted chart data
      const minUserIndex = chartData.findIndex((band) => Number(band.n) === minUserBandNumber)
      const maxUserIndex = chartData.findIndex((band) => Number(band.n) === maxUserBandNumber)
      const userBandSpan = maxUserIndex - minUserIndex + 1

      // User bands should take up ~40% of the visible window
      const targetUserBandWindow = Math.ceil(defaultBrushWindow * 0.4)
      const remainingWindow = defaultBrushWindow - targetUserBandWindow

      if (userBandSpan <= targetUserBandWindow) {
        // User bands fit in 40% of window, center them with padding
        const padding = Math.floor(remainingWindow / 2)
        return Math.max(0, minUserIndex - padding)
      } else {
        // User bands span more than 40% of window, start from first user band
        return minUserIndex
      }
    } else {
      // No user bands, center on oracle price band
      if (oraclePriceBand !== null && oraclePriceBand !== undefined) {
        const oracleBandIndex = chartData.findIndex((band) => Number(band.n) === oraclePriceBand)
        if (oracleBandIndex !== -1) {
          const halfWindow = Math.floor(defaultBrushWindow / 2)
          const desiredStartIndex = oracleBandIndex - halfWindow
          return Math.max(0, Math.min(desiredStartIndex, chartData.length - defaultBrushWindow))
        }
      }
      // Fallback to original logic if oracle price band is not found
      return Math.max(0, chartData.length - defaultBrushWindow)
    }
  }, [userBandsBalances, chartData, defaultBrushWindow, oraclePriceBand])

  const defaultEndIndex = useMemo(
    () => Math.min(chartData.length - 1, defaultStartIndex + defaultBrushWindow - 1),
    [chartData.length, defaultStartIndex, defaultBrushWindow],
  )

  const visibleData = useMemo(() => {
    const startIndex = brushStartIndex ?? defaultStartIndex
    const endIndex = brushEndIndex ?? defaultEndIndex
    return chartData.slice(startIndex, endIndex + 1)
  }, [brushStartIndex, brushEndIndex, chartData, defaultStartIndex, defaultEndIndex])

  const yDomain = useMemo(() => {
    if (visibleData.length === 0) {
      return undefined // let recharts decide
    }

    const prices = visibleData.flatMap((d) => [d.p_up, d.p_down])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    const padding = (maxPrice - minPrice) * 0.05

    return [minPrice - padding, maxPrice + padding]
  }, [visibleData])

  const userBandsPriceRange = useMemo(() => {
    if (userBandsBalances.length === 0) return null

    const userBandNumbers = new Set(userBandsBalances.map((band) => String(band.n)))

    const minUserBand = chartData.find((band) => userBandNumbers.has(String(band.n)))

    if (!minUserBand) return null

    let maxUserBand: ChartDataPoint | undefined
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (userBandNumbers.has(String(chartData[i].n))) {
        maxUserBand = chartData[i]
        break
      }
    }

    if (!maxUserBand) return null

    return {
      lowerBandMedianPrice: minUserBand.pUpDownMedian,
      lowerBandPriceDown: minUserBand.p_down,
      upperBandMedianPrice: maxUserBand.pUpDownMedian,
      upperBandPriceUp: maxUserBand.p_up,
    }
  }, [userBandsBalances, chartData])

  const handleBrushChange = (newIndex: { startIndex?: number; endIndex?: number }) => {
    setBrushStartIndex(newIndex.startIndex)
    setBrushEndIndex(newIndex.endIndex)
  }

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
            color: textColor,
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
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: `${height}px`,
      }}
    >
      <Box sx={{ width: '100%', fontVariantNumeric: 'tabular-nums', height }}>
        <ResponsiveContainer width="99%" height="100%">
          <ComposedChart layout="vertical" data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: 20 }}>
            {userBandsPriceRange && (
              <ReferenceArea
                y1={userBandsPriceRange.lowerBandPriceDown}
                y2={userBandsPriceRange.upperBandPriceUp}
                fill={userRangeHighlightColor}
                stroke="none"
              />
            )}
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
            <XAxis
              type="number"
              reversed={true}
              stroke={gridColor}
              tick={{ fill: gridColor, fontSize: 12 }}
              tickFormatter={(value) => `$${formatNumber(value, { notation: 'compact' })}`}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey="pUpDownMedian"
              orientation="right"
              stroke={gridColor}
              tick={{ fill: gridColor, fontSize: 12 }}
              tickFormatter={(value) => `$${formatNumber(value, { notation: 'compact' })}`}
              axisLine={false}
              domain={yDomain}
              reversed={true}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint
                  return (
                    <Stack
                      sx={{
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor,
                        border: `1px solid ${borderColor}`,
                        gap: '4px',
                      }}
                    >
                      <Box sx={{ fontSize: '12px', color: textColor }}>
                        <strong>Band {data.n}</strong>
                      </Box>
                      {data.marketCollateral > 0 && (
                        <Box sx={{ fontSize: '12px', color: textColor }}>
                          Market Collateral: ${formatNumber(data.marketCollateral, { maximumFractionDigits: 4 })}
                        </Box>
                      )}
                      {data.userCollateral > 0 && (
                        <Box sx={{ fontSize: '12px', color: textColor }}>
                          User Collateral: ${formatNumber(data.userCollateral, { maximumFractionDigits: 4 })}
                        </Box>
                      )}
                      {data.p_up && (
                        <Box sx={{ fontSize: '12px', color: textColor }}>
                          Price Range: ${formatNumber(data.p_down)} - ${formatNumber(data.p_up)}
                        </Box>
                      )}
                    </Stack>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="marketCollateral" stackId="bands">
              {visibleData.map((entry, index) => {
                const isLiquidation = entry.isLiquidationBand === 'SL'
                return (
                  <Cell
                    key={`cell-market-${index}`}
                    fill={marketBandColor}
                    stroke={isLiquidation ? liquidationBandOutlineColor : 'none'}
                    strokeWidth={isLiquidation ? 2 : 0}
                  />
                )
              })}
            </Bar>
            <Bar dataKey="userCollateral" stackId="bands">
              {visibleData.map((entry, index) => {
                const isLiquidation = entry.isLiquidationBand === 'SL'
                return (
                  <Cell
                    key={`cell-user-${index}`}
                    fill={userBandColor}
                    stroke={isLiquidation ? liquidationBandOutlineColor : 'none'}
                    strokeWidth={isLiquidation ? 2 : 0}
                  />
                )
              })}
            </Bar>
            {userBandsPriceRange && (
              <ReferenceLine
                y={userBandsPriceRange.lowerBandPriceDown}
                stroke={userRangeLabelBackgroundColor}
                strokeWidth={2}
                strokeDasharray="3 3"
                label={
                  <CustomLabelWithBackground
                    backgroundColor={userRangeLabelBackgroundColor}
                    value={`$${formatNumber(userBandsPriceRange.lowerBandPriceDown, {
                      notation: 'compact',
                    })}`}
                    fill={textColor}
                  />
                }
              />
            )}
            {userBandsPriceRange && (
              <ReferenceLine
                y={userBandsPriceRange.upperBandPriceUp}
                stroke={userRangeLabelBackgroundColor}
                strokeWidth={2}
                strokeDasharray="3 3"
                label={
                  <CustomLabelWithBackground
                    value={`$${formatNumber(userBandsPriceRange.upperBandPriceUp, {
                      notation: 'compact',
                    })}`}
                    fill={textColor}
                    backgroundColor={userRangeLabelBackgroundColor}
                  />
                }
              />
            )}

            {oraclePrice && (
              <ReferenceLine
                y={oraclePrice}
                stroke={oraclePriceLineColor}
                strokeDasharray="3 3"
                label={
                  <CustomLabelWithBackground
                    value={`$${formatNumber(oraclePrice, {
                      notation: 'compact',
                    })}`}
                    fill={textColorInverted}
                    backgroundColor={oraclePriceLineColor}
                  />
                }
              />
            )}

            {chartData.length > defaultBrushWindow && (
              <Brush
                dataKey="n"
                height={30}
                stroke={gridColor}
                fill={backgroundColor}
                startIndex={brushStartIndex ?? defaultStartIndex}
                endIndex={brushEndIndex ?? defaultEndIndex}
                onChange={handleBrushChange}
                travellerWidth={10}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}

function _findDataIndex(d: BandsBalancesData & { isOraclePriceBand: boolean }) {
  return (
    +d.collateral !== 0 ||
    d.collateralBorrowedUsd !== 0 ||
    d.isLiquidationBand === 'SL' ||
    d.isOraclePriceBand ||
    +d.borrowed > 0
  )
}

function _parseData(data: (BandsBalancesData & { isOraclePriceBand: boolean })[]) {
  const firstDataIdx = data.findIndex(_findDataIndex)
  const lastDataIdx = data.findLastIndex(_findDataIndex)

  if (firstDataIdx === -1) {
    return data
  }

  return data.slice(firstDataIdx, lastDataIdx + 1)
}
