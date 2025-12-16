import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import type { LiquidationRanges, LlammaLiquididationRange } from '@ui-kit/features/candle-chart/types'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui-kit/features/candle-chart/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

const CHART_HEIGHT = 300

export type LendingMarketTokens = {
  borrowedToken: {
    symbol: string
    address: string
  }
  collateralToken: {
    symbol: string
    address: string
  }
} | null

export type UseOhlcChartStateProps = {
  rChainId: ChainId
  rOwmId: string
  userActiveKey: string
}

export const useOhlcChartState = ({ rChainId, userActiveKey, rOwmId }: UseOhlcChartStateProps) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const borrowMoreActiveKey = useStore((state) => state.loanBorrowMore.activeKey)
  const loanRepayActiveKey = useStore((state) => state.loanRepay.activeKey)
  const loanCollateralAddActiveKey = useStore((state) => state.loanCollateralAdd.activeKey)
  const loanCollateralRemoveActiveKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const loanCreateLeverageDetailInfo = useStore((state) => state.loanCreate.detailInfoLeverage[activeKey])
  const userPrices = useUserLoanDetails(userActiveKey)?.prices ?? null
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const borrowMorePrices = useStore((state) => state.loanBorrowMore.detailInfo[borrowMoreActiveKey]?.prices ?? null)
  const repayActiveKey = useStore((state) => state.loanRepay.activeKey)
  const repayLeveragePrices = useStore((state) => state.loanRepay.detailInfoLeverage[repayActiveKey]?.prices ?? null)
  const repayLoanPrices = useStore((state) => state.loanRepay.detailInfo[loanRepayActiveKey]?.prices ?? null)
  const addCollateralPrices = useStore(
    (state) => state.loanCollateralAdd.detailInfo[loanCollateralAddActiveKey]?.prices ?? null,
  )
  const removeCollateralPrices = useStore(
    (state) => state.loanCollateralRemove.detailInfo[loanCollateralRemoveActiveKey]?.prices ?? null,
  )
  const theme = useUserProfileStore((state) => state.theme)
  const chartLlammaOhlc = useStore((state) => state.ohlcCharts.chartLlammaOhlc)
  const chartOraclePoolOhlc = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc)
  const timeOption = useStore((state) => state.ohlcCharts.timeOption)
  const setChartTimeOption = useStore((state) => state.ohlcCharts.setChartTimeOption)
  const fetchLlammaOhlcData = useStore((state) => state.ohlcCharts.fetchLlammaOhlcData)
  const fetchOraclePoolOhlcData = useStore((state) => state.ohlcCharts.fetchOraclePoolOhlcData)
  const fetchMoreData = useStore((state) => state.ohlcCharts.fetchMoreData)
  const toggleLiqRangeCurrentVisible = useStore((state) => state.ohlcCharts.toggleLiqRangeCurrentVisible)
  const toggleLiqRangeNewVisible = useStore((state) => state.ohlcCharts.toggleLiqRangeNewVisible)
  const toggleOraclePriceVisible = useStore((state) => state.ohlcCharts.toggleOraclePriceVisible)
  const liqRangeCurrentVisible = useStore((state) => state.ohlcCharts.liqRangeCurrentVisible)
  const liqRangeNewVisible = useStore((state) => state.ohlcCharts.liqRangeNewVisible)
  const oraclePriceVisible = useStore((state) => state.ohlcCharts.oraclePriceVisible)
  const priceInfo = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices ?? null)

  const { oraclePrice } = priceInfo ?? {}
  const [selectedChartIndex, setChartSelectedIndex] = useState(0)

  const ohlcDataUnavailable = chartLlammaOhlc.dataDisabled && chartOraclePoolOhlc.dataDisabled

  const currentChart = useMemo(
    () => (selectedChartIndex === 0 ? chartOraclePoolOhlc : chartLlammaOhlc),
    [chartLlammaOhlc, chartOraclePoolOhlc, selectedChartIndex],
  )

  const oraclePriceData = useMemo(() => {
    if (selectedChartIndex === 0) {
      if (chartOraclePoolOhlc.oraclePriceData.length > 0) return chartOraclePoolOhlc.oraclePriceData
      if (chartLlammaOhlc.oraclePriceData.length > 0) return chartLlammaOhlc.oraclePriceData
      return undefined
    }
    if (chartLlammaOhlc.oraclePriceData.length > 0) return chartLlammaOhlc.oraclePriceData
    if (chartOraclePoolOhlc.oraclePriceData.length > 0) return chartOraclePoolOhlc.oraclePriceData
    return undefined
  }, [chartLlammaOhlc.oraclePriceData, chartOraclePoolOhlc.oraclePriceData, selectedChartIndex])

  const selectedLiqRange = useMemo(() => {
    const liqRanges: LiquidationRanges = {
      current: null,
      new: null,
    }

    const formatRange = (liqRange: string[]) => {
      const range: LlammaLiquididationRange = {
        price1: [],
        price2: [],
      }

      const chartArray = currentChart.data.length !== 0 ? currentChart.data : currentChart.oraclePriceData

      for (const data of chartArray) {
        range.price1 = [
          ...range.price1,
          {
            time: data.time,
            value: +liqRange[1],
          },
        ]
        range.price2 = [
          ...range.price2,
          {
            time: data.time,
            value: +liqRange[0],
          },
        ]
      }
      return range
    }

    if (formValues.n && liqRangesMapper && currentChart.data) {
      if (liqRangesMapper[formValues.n].prices.length !== 0) {
        const currentPrices = liqRangesMapper[formValues.n].prices

        if (currentPrices.length !== 0) {
          liqRanges.new = formatRange([currentPrices[1], currentPrices[0]])
        }
      } else {
        const currentPrices = loanCreateLeverageDetailInfo?.prices

        if (currentPrices) {
          liqRanges.new = formatRange([currentPrices[0], currentPrices[1]])
        }
      }
    }

    if (userPrices?.length && currentChart.data) {
      liqRanges.current = formatRange(userPrices)
    }
    if (borrowMorePrices?.length && currentChart.data) {
      liqRanges.new = formatRange(borrowMorePrices)
    }
    if (repayLoanPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(repayLoanPrices)
    }
    if (addCollateralPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(addCollateralPrices)
    }
    if (removeCollateralPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(removeCollateralPrices)
    }
    if (repayLeveragePrices?.length && currentChart.data) {
      liqRanges.new = formatRange(repayLeveragePrices)
    }

    return liqRanges
  }, [
    formValues.n,
    liqRangesMapper,
    currentChart.data,
    currentChart.oraclePriceData,
    userPrices,
    borrowMorePrices,
    repayLoanPrices,
    addCollateralPrices,
    removeCollateralPrices,
    repayLeveragePrices,
    loanCreateLeverageDetailInfo?.prices,
  ])

  const coins: LendingMarketTokens = useMemo(
    () =>
      market
        ? {
            borrowedToken: {
              symbol: market?.borrowed_token.symbol,
              address: market?.borrowed_token.address,
            },
            collateralToken: {
              symbol: market?.collateral_token.symbol,
              address: market?.collateral_token.address,
            },
          }
        : null,
    [market],
  )

  const selectChartList = useMemo(() => {
    if (chartOraclePoolOhlc.fetchStatus === 'LOADING') {
      return [{ label: t`Loading` }, { label: t`Loading` }]
    }

    if (market) {
      if (chartOraclePoolOhlc.dataDisabled) {
        return [{ label: t`${coins?.collateralToken.symbol} / ${coins?.borrowedToken.symbol} (LLAMMA)` }]
      }

      return [
        {
          label: t`${chartOraclePoolOhlc.collateralToken.symbol} / ${chartOraclePoolOhlc.borrowedToken.symbol}`,
        },
        {
          label: t`${coins?.collateralToken.symbol} / ${coins?.borrowedToken.symbol} (LLAMMA)`,
        },
      ]
    }

    return []
  }, [
    chartOraclePoolOhlc.borrowedToken.symbol,
    chartOraclePoolOhlc.collateralToken.symbol,
    chartOraclePoolOhlc.dataDisabled,
    chartOraclePoolOhlc.fetchStatus,
    coins?.borrowedToken.symbol,
    coins?.collateralToken.symbol,
    market,
  ])

  useEffect(() => {
    if (chartOraclePoolOhlc.dataDisabled) {
      setChartSelectedIndex(1)
    }
  }, [chartOraclePoolOhlc.dataDisabled])

  const chartTimeSettings = useMemo(() => {
    const threeHundredResultsAgo = getThreeHundredResultsAgo(timeOption, Date.now() / 1000)

    return {
      start: +threeHundredResultsAgo,
      end: Math.floor(Date.now() / 1000),
    }
  }, [timeOption])

  const chartInterval = useMemo(() => {
    if (timeOption === '15m') return 15
    if (timeOption === '30m') return 30
    if (timeOption === '1h') return 1
    if (timeOption === '4h') return 4
    if (timeOption === '6h') return 6
    if (timeOption === '12h') return 12
    if (timeOption === '1d') return 1
    if (timeOption === '7d') return 7
    return 14
  }, [timeOption])

  const timeUnit = useMemo(() => {
    if (timeOption === '15m') return 'minute'
    if (timeOption === '30m') return 'minute'
    if (timeOption === '1h') return 'hour'
    if (timeOption === '4h') return 'hour'
    if (timeOption === '6h') return 'hour'
    if (timeOption === '12h') return 'hour'
    if (timeOption === '1d') return 'day'
    if (timeOption === '7d') return 'day'
    return 'day'
  }, [timeOption])

  const refetchPricesData = useCallback(() => {
    if (market?.addresses.controller) {
      void fetchOraclePoolOhlcData(
        rChainId,
        market.addresses.controller,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end,
      )
    }
    if (market?.addresses.amm) {
      void fetchLlammaOhlcData(
        rChainId,
        rOwmId,
        market.addresses.amm,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end,
      )
    }
  }, [
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    fetchLlammaOhlcData,
    fetchOraclePoolOhlcData,
    market?.addresses.amm,
    market?.addresses.controller,
    rChainId,
    rOwmId,
    timeUnit,
  ])

  useEffect(() => {
    if (market !== undefined) {
      refetchPricesData()
    }
  }, [market, refetchPricesData])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      if (market?.addresses.controller && market?.addresses.amm) {
        void fetchMoreData(
          rChainId,
          market?.addresses.controller,
          market?.addresses.amm,
          chartInterval,
          timeUnit,
          startTime,
          endTime,
        )
      }
    },
    [timeOption, fetchMoreData, rChainId, market?.addresses.amm, market?.addresses.controller, chartInterval, timeUnit],
  )

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: true,
    chartType: 'crvusd',
    chartStatus: currentChart.fetchStatus,
    chartHeight: CHART_HEIGHT,
    themeType: theme,
    ohlcData: currentChart.data,
    oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption,
    selectedChartIndex,
    setChartSelectedIndex,
    selectChartList,
    setChartTimeOption,
    refetchPricesData,
    refetchingCapped: currentChart.refetchingCapped,
    fetchMoreChartData,
    lastFetchEndTime: currentChart.lastFetchEndTime,
    toggleLiqRangeCurrentVisible,
    toggleLiqRangeNewVisible,
    toggleOraclePriceVisible,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice: oraclePrice,
  }

  return {
    coins,
    ohlcDataUnavailable,
    ohlcChartProps,
  }
}
