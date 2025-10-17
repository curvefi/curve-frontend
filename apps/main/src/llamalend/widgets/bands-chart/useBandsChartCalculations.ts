import { useMemo } from 'react'
import { ChartDataPoint, BandsBalancesData, UserBandsPriceRange, DerivedChartData } from './types'

type UseBandsChartCalculationsReturn = {
  userBandsPriceRange: UserBandsPriceRange
  derived: DerivedChartData
  initialZoomIndices: { startIndex: number; endIndex: number } | null
}

export const useBandsChartCalculations = (
  chartData: ChartDataPoint[],
  userBandsBalances: BandsBalancesData[],
  oraclePrice: string | undefined,
): UseBandsChartCalculationsReturn => {
  const userBandsPriceRange: UserBandsPriceRange = useMemo(() => {
    if (userBandsBalances.length === 0) return null

    const userBandNumbers = new Set(userBandsBalances.map((band) => String(band.n)))

    let minUserIdx = Number.POSITIVE_INFINITY
    let maxUserIdx = Number.NEGATIVE_INFINITY
    let found = false

    for (let i = 0; i < chartData.length; i++) {
      if (userBandNumbers.has(String(chartData[i].n))) {
        found = true
        if (i < minUserIdx) minUserIdx = i
        if (i > maxUserIdx) maxUserIdx = i
      }
    }

    if (!found) return null

    const highestPriceUserBand = chartData[minUserIdx]
    const lowestPriceUserBand = chartData[maxUserIdx]

    return {
      minUserIdx,
      maxUserIdx,
      upperBandPriceUp: highestPriceUserBand.p_up,
      lowerBandPriceDown: lowestPriceUserBand.p_down,
    }
  }, [userBandsBalances, chartData])

  const derived: DerivedChartData = useMemo(() => {
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

  const initialZoomIndices = useMemo(() => {
    const len = chartData.length
    if (len === 0) return null

    const fullRange = { startIndex: 0, endIndex: len - 1 }

    if (userBandsBalances.length === 0) {
      return fullRange
    }

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
      return fullRange
    }

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

    const pad = 2
    startIndex = Math.max(0, startIndex - pad)
    endIndex = Math.min(len - 1, endIndex + pad)

    return { startIndex, endIndex }
  }, [chartData, userBandsBalances, oraclePrice])

  return { userBandsPriceRange, derived, initialZoomIndices }
}
