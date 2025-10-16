import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import type { ChartDataPoint } from '@/llamalend/widgets/bands-chart/types'

export const useBandsData = ({
  rChainId,
  rOwmId,
  api,
  market,
}: Pick<PageContentProps, 'api' | 'rChainId' | 'rOwmId' | 'market'>) => {
  const userActiveKey = helpers.getUserActiveKey(api, market!)

  const { userBandsBalances, liquidationBand, marketBandsBalances, oraclePrice, oraclePriceBand } = useStore(
    (state) => {
      const marketPrices = state.markets.pricesMapper[rChainId]?.[rOwmId]
      const marketStatsBands = state.markets.statsBandsMapper[rChainId]?.[rOwmId]
      const userLoanDetails = state.user.loansDetailsMapper[userActiveKey]

      return {
        userBandsBalances: userLoanDetails?.details?.bandsBalances,
        liquidationBand: marketStatsBands?.bands?.liquidationBand,
        marketBandsBalances: marketStatsBands?.bands?.bandsBalances,
        oraclePrice: marketPrices?.prices?.oraclePrice,
        oraclePriceBand: marketPrices?.prices?.oraclePriceBand,
      }
    },
    shallow,
  )

  const chartData = useMemo(() => {
    const marketBands = marketBandsBalances ?? []
    const userBands = userBandsBalances ?? []

    const bandsMap = new Map<string, ChartDataPoint>()

    marketBands.forEach((band) => {
      const key = String(band.n)
      bandsMap.set(key, {
        n: Number(band.n),
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        bandCollateralAmount: Number(band.collateral),
        bandCollateralValueUsd: Number(band.collateralUsd),
        bandBorrowedAmount: Number(band.borrowed),
        bandBorrowedValueUsd: Number(band.borrowed),
        bandTotalCollateralValueUsd: Number(band.collateralBorrowedUsd),
        userBandCollateralAmount: 0,
        userBandCollateralValueUsd: 0,
        userBandBorrowedAmount: 0,
        userBandBorrowedValueUsd: 0,
        userBandTotalCollateralValueUsd: 0,
        isLiquidationBand: band.isLiquidationBand,
        isOraclePriceBand: Number(band.n) === oraclePriceBand,
      })
    })

    userBands.forEach((band) => {
      const key = String(band.n)
      const existing = bandsMap.get(key)
      if (existing) {
        existing.userBandCollateralAmount = Number(band.collateral)
        existing.userBandCollateralValueUsd = Number(band.collateralUsd)
        existing.userBandBorrowedAmount = Number(band.borrowed)
        existing.userBandBorrowedValueUsd = Number(band.borrowed)
        existing.userBandTotalCollateralValueUsd = Number(band.collateralBorrowedUsd)
      } else {
        bandsMap.set(key, {
          n: Number(band.n),
          pUpDownMedian: Number(band.pUpDownMedian),
          p_up: Number(band.p_up),
          p_down: Number(band.p_down),
          bandCollateralAmount: 0,
          bandCollateralValueUsd: 0,
          bandBorrowedAmount: 0,
          bandBorrowedValueUsd: 0,
          bandTotalCollateralValueUsd: 0,
          userBandCollateralAmount: Number(band.collateral),
          userBandCollateralValueUsd: Number(band.collateralUsd),
          userBandBorrowedAmount: Number(band.borrowed),
          userBandBorrowedValueUsd: Number(band.borrowed),
          userBandTotalCollateralValueUsd: Number(band.collateralBorrowedUsd),
          isLiquidationBand: band.isLiquidationBand,
          isOraclePriceBand: Number(band.n) === oraclePriceBand,
        })
      }
    })

    const parsedData = Array.from(bandsMap.values())
    const firstDataIdx = parsedData.findIndex(_findDataIndex)
    const lastDataIdx = parsedData.findLastIndex(_findDataIndex)

    if (firstDataIdx === -1) {
      return parsedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
    }

    const slicedData = parsedData.slice(firstDataIdx, lastDataIdx + 1)
    return slicedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
  }, [marketBandsBalances, userBandsBalances, oraclePriceBand])

  return {
    chartData,
    userBandsBalances, // Pass original for brush calculation
    liquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}

function _findDataIndex(d: ChartDataPoint) {
  return (
    d.bandCollateralValueUsd > 0 ||
    d.bandBorrowedValueUsd > 0 ||
    d.isLiquidationBand === 'SL' ||
    d.isOraclePriceBand ||
    d.userBandCollateralValueUsd > 0 ||
    d.userBandBorrowedValueUsd > 0
  )
}
