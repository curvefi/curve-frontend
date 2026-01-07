import { useCallback, useEffect, useMemo } from 'react'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { Llamma, ChainId } from '@/loan/types/loan.types'
import { useLlammaChartSelections } from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import type { LiquidationRanges, LlammaLiquididationRange } from '@ui-kit/features/candle-chart/types'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui-kit/features/candle-chart/utils'

export type LlammaLiquidityCoins = {
  crvusd: {
    symbol: string
    address: string
  }
  collateral: {
    symbol: string
    address: string
  }
} | null

type OhlcChartStateProps = {
  rChainId: ChainId
  llamma: Llamma | null
  llammaId: string
}

export const useOhlcChartState = ({ rChainId, llamma, llammaId }: OhlcChartStateProps) => {
  const poolAddress = llamma?.address ?? ''
  const controllerAddress = llamma?.controller ?? ''
  const increaseActiveKey = useStore((state) => state.loanIncrease.activeKey)
  const decreaseActiveKey = useStore((state) => state.loanDecrease.activeKey)
  const deleverageActiveKey = useStore((state) => state.loanDeleverage.activeKey)
  const collateralIncreaseActiveKey = useStore((state) => state.loanCollateralIncrease.activeKey)
  const collateralDecreaseActiveKey = useStore((state) => state.loanCollateralDecrease.activeKey)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const userPrices = useUserLoanDetails(llammaId)?.userPrices ?? null
  const increaseLoanPrices = useStore((state) => state.loanIncrease.detailInfo[increaseActiveKey]?.prices ?? null)
  const decreaseLoanPrices = useStore((state) => state.loanDecrease.detailInfo[decreaseActiveKey]?.prices ?? null)
  const deleveragePrices = useStore((state) => state.loanDeleverage.detailInfo[deleverageActiveKey]?.prices ?? null)
  const increaseCollateralPrices = useStore(
    (state) => state.loanCollateralIncrease.detailInfo[collateralIncreaseActiveKey]?.prices ?? null,
  )
  const decreaseCollateralPrices = useStore(
    (state) => state.loanCollateralDecrease.detailInfo[collateralDecreaseActiveKey]?.prices ?? null,
  )
  const chartLlammaOhlc = useStore((state) => state.ohlcCharts.chartLlammaOhlc)
  const chartOraclePoolOhlc = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc)
  const timeOption = useStore((state) => state.ohlcCharts.timeOption)
  const setChartTimeOption = useStore((state) => state.ohlcCharts.setChartTimeOption)
  const fetchLlammaOhlcData = useStore((state) => state.ohlcCharts.fetchLlammaOhlcData)
  const fetchOracleOhlcData = useStore((state) => state.ohlcCharts.fetchOracleOhlcData)
  const fetchMoreData = useStore((state) => state.ohlcCharts.fetchMoreData)
  const toggleLiqRangeCurrentVisible = useStore((state) => state.ohlcCharts.toggleLiqRangeCurrentVisible)
  const toggleLiqRangeNewVisible = useStore((state) => state.ohlcCharts.toggleLiqRangeNewVisible)
  const toggleOraclePriceVisible = useStore((state) => state.ohlcCharts.toggleOraclePriceVisible)
  const liqRangeCurrentVisible = useStore((state) => state.ohlcCharts.liqRangeCurrentVisible)
  const liqRangeNewVisible = useStore((state) => state.ohlcCharts.liqRangeNewVisible)
  const oraclePriceVisible = useStore((state) => state.ohlcCharts.oraclePriceVisible)
  const priceInfo = useStore((state) => state.loans.detailsMapper[llammaId]?.priceInfo ?? null)

  const { oraclePrice } = priceInfo ?? {}

  // Token symbols for chart labels (oracle tokens come from API response)
  const oracleTokens = useMemo(
    () =>
      chartOraclePoolOhlc.collateralToken.symbol && chartOraclePoolOhlc.borrowedToken.symbol
        ? {
            collateralSymbol: chartOraclePoolOhlc.collateralToken.symbol,
            borrowedSymbol: chartOraclePoolOhlc.borrowedToken.symbol,
          }
        : null,
    [chartOraclePoolOhlc.collateralToken.symbol, chartOraclePoolOhlc.borrowedToken.symbol],
  )

  // LLAMMA tokens from llamma data
  const llammaTokens = useMemo(
    () =>
      llamma
        ? {
            collateralSymbol: llamma.coins[1],
            borrowedSymbol: 'crvUSD',
          }
        : null,
    [llamma],
  )

  const {
    currentChart,
    selectChartList,
    selectedChartKey,
    setSelectedChart,
    oraclePriceData,
    isLoading,
    noDataAvailable,
  } = useLlammaChartSelections({
    oracleChart: chartOraclePoolOhlc,
    llammaChart: chartLlammaOhlc,
    oracleTokens,
    llammaTokens,
  })

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

      for (const data of currentChart.data) {
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
      const currentPrices = liqRangesMapper[formValues.n].prices

      if (currentPrices.length !== 0) {
        liqRanges.new = formatRange([currentPrices[1], currentPrices[0]])
      }
    }

    if (userPrices && currentChart.data) {
      liqRanges.current = formatRange(userPrices)
    }
    if (increaseLoanPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(increaseLoanPrices)
    }
    if (decreaseLoanPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(decreaseLoanPrices)
    }
    if (increaseCollateralPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(increaseCollateralPrices)
    }
    if (decreaseCollateralPrices?.length && currentChart.data) {
      liqRanges.new = formatRange(decreaseCollateralPrices)
    }
    if (deleveragePrices?.length && currentChart.data) {
      liqRanges.new = formatRange(deleveragePrices)
    }

    return liqRanges
  }, [
    currentChart.data,
    decreaseCollateralPrices,
    decreaseLoanPrices,
    deleveragePrices,
    formValues.n,
    increaseCollateralPrices,
    increaseLoanPrices,
    liqRangesMapper,
    userPrices,
  ])

  const coins: LlammaLiquidityCoins = useMemo(
    () =>
      llamma
        ? {
            crvusd: {
              symbol: llamma?.coins[0],
              address: llamma?.coinAddresses[0],
            },
            collateral: {
              symbol: llamma?.coins[1],
              address: llamma?.coinAddresses[1],
            },
          }
        : null,
    [llamma],
  )

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
    return 14 // 14d
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
    return 'day' // 14d
  }, [timeOption])

  const refetchPricesData = useCallback(() => {
    void fetchOracleOhlcData(
      rChainId,
      controllerAddress,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end,
    )
    void fetchLlammaOhlcData(
      rChainId,
      llammaId,
      poolAddress,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end,
    )
  }, [
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    controllerAddress,
    fetchLlammaOhlcData,
    fetchOracleOhlcData,
    poolAddress,
    rChainId,
    llammaId,
    timeUnit,
  ])

  useEffect(() => {
    if (llamma !== undefined) {
      refetchPricesData()
    }
  }, [llamma, refetchPricesData])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      void fetchMoreData(rChainId, controllerAddress, poolAddress, chartInterval, timeUnit, +startTime, endTime)
    },
    [timeOption, fetchMoreData, rChainId, controllerAddress, poolAddress, chartInterval, timeUnit],
  )

  // Derive index for ChartWrapper compatibility
  const selectedChartIndex = selectChartList.findIndex((chart) => chart.key === selectedChartKey)

  // Determine chart status: loading > error (no data) > ready
  const chartStatus = isLoading || !llamma ? 'LOADING' : noDataAvailable ? 'ERROR' : 'READY'

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: true,
    chartHeight: DEFAULT_CHART_HEIGHT,
    chartStatus,
    ohlcData: currentChart.data,
    oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption,
    selectedChartIndex: Math.max(0, selectedChartIndex),
    selectChartList,
    refetchPricesData,
    refetchingCapped: currentChart.refetchingCapped,
    fetchMoreChartData,
    lastFetchEndTime: currentChart.lastFetchEndTime,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice: oraclePrice,
  }

  return {
    poolAddress,
    coins,
    ohlcDataUnavailable: noDataAvailable,
    setSelectedChart,
    setChartTimeOption,
    toggleLiqRangeCurrentVisible,
    toggleLiqRangeNewVisible,
    toggleOraclePriceVisible,
    ohlcChartProps,
  }
}
