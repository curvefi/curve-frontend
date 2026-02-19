import { useCallback, useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import { useUserPrices } from '@/llamalend/queries/user'
import { useStore } from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import {
  useChartLegendToggles,
  useChartTimeSettings,
  useLiquidationRange,
  useLlammaChartSelections,
} from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui-kit/features/candle-chart/utils'
import type { Range } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'

export type LlammaLiquidityCoins = ReturnType<typeof getTokens> | undefined | null

type OhlcChartStateProps = {
  chainId: ChainId
  market: Llamma | null
  marketId: string
  previewPrices: Range<Decimal> | undefined
}

const useLegacyChartPrices = () => {
  const increaseActiveKey = useStore((state) => state.loanIncrease.activeKey)
  const decreaseActiveKey = useStore((state) => state.loanDecrease.activeKey)
  const deleverageActiveKey = useStore((state) => state.loanDeleverage.activeKey)
  const collateralIncreaseActiveKey = useStore((state) => state.loanCollateralIncrease.activeKey)
  const collateralDecreaseActiveKey = useStore((state) => state.loanCollateralDecrease.activeKey)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const increaseLoanPrices = useStore((state) => state.loanIncrease.detailInfo[increaseActiveKey]?.prices ?? null)
  const decreaseLoanPrices = useStore((state) => state.loanDecrease.detailInfo[decreaseActiveKey]?.prices ?? null)
  const deleveragePrices = useStore((state) => state.loanDeleverage.detailInfo[deleverageActiveKey]?.prices ?? null)
  const increaseCollateralPrices = useStore(
    (state) => state.loanCollateralIncrease.detailInfo[collateralIncreaseActiveKey]?.prices ?? null,
  )
  const decreaseCollateralPrices = useStore(
    (state) => state.loanCollateralDecrease.detailInfo[collateralDecreaseActiveKey]?.prices ?? null,
  )
  return useMemo(() => {
    if (deleveragePrices?.length) return deleveragePrices
    if (decreaseCollateralPrices?.length) return decreaseCollateralPrices
    if (increaseCollateralPrices?.length) return increaseCollateralPrices
    if (decreaseLoanPrices?.length) return decreaseLoanPrices
    if (increaseLoanPrices?.length) return increaseLoanPrices
    if (formValues.n && liqRangesMapper?.[formValues.n]?.prices?.length) {
      const prices = liqRangesMapper[formValues.n].prices
      return [prices[1], prices[0]]
    }
    return undefined
  }, [
    deleveragePrices,
    decreaseCollateralPrices,
    increaseCollateralPrices,
    decreaseLoanPrices,
    increaseLoanPrices,
    formValues.n,
    liqRangesMapper,
  ]) as Range<Decimal> | undefined
}

export const useOhlcChartState = ({ chainId, market, marketId, previewPrices }: OhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const storePreviewPrices = useLegacyChartPrices()
  const { data: userPrices } = useUserPrices({ chainId, marketId, userAddress })
  const chartLlammaOhlc = useStore((state) => state.ohlcCharts.chartLlammaOhlc)
  const chartOraclePoolOhlc = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc)
  const fetchLlammaOhlcData = useStore((state) => state.ohlcCharts.fetchLlammaOhlcData)
  const fetchOracleOhlcData = useStore((state) => state.ohlcCharts.fetchOracleOhlcData)
  const fetchMoreData = useStore((state) => state.ohlcCharts.fetchMoreData)
  const priceInfo = useStore((state) => state.loans.detailsMapper[marketId]?.priceInfo ?? null)
  const poolAddress = market?.address ?? ''
  const controllerAddress = market?.controller ?? ''

  const { oraclePrice } = priceInfo ?? {}

  // Token symbols for chart labels (oracle tokens comes from API response)
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

  const { selectChartList, selectedChartKey, isLoading } = useLlammaChartSelections({
    oracleChart: { fetchStatus: chartOraclePoolOhlc.fetchStatus, hasData: chartOraclePoolOhlc.data.length > 0 },
    llammaChart: { fetchStatus: chartLlammaOhlc.fetchStatus, hasData: chartLlammaOhlc.oraclePriceData.length > 0 },
    oracleTokens,
  })

  // Select chart data based on current selection
  const currentChart = selectedChartKey === 'llamma' ? chartLlammaOhlc : chartOraclePoolOhlc
  // we no longer want to use the llamma endpoint for it's ohlc data as it's deemed too spotty, pass empty array for ohlc data when llamma is selected
  const ohlcData = selectedChartKey === 'llamma' ? [] : chartOraclePoolOhlc.data
  const noDataAvailable = !isLoading && currentChart.oraclePriceData.length === 0

  const oraclePriceData = useMemo(() => {
    if (chartOraclePoolOhlc.oraclePriceData.length > 0) return chartOraclePoolOhlc.oraclePriceData
    // if the oracle data endpoint doesn't have oracle price data, there's a higher chance that it still exists in the llamma endpoint
    if (chartLlammaOhlc.oraclePriceData.length > 0) return chartLlammaOhlc.oraclePriceData
    return undefined
  }, [chartOraclePoolOhlc.oraclePriceData, chartLlammaOhlc.oraclePriceData])

  const newLiqPrices = previewPrices ?? storePreviewPrices

  const { oraclePriceVisible, liqRangeCurrentVisible, liqRangeNewVisible, legendSets } = useChartLegendToggles({
    hasNewLiquidationRange: !!newLiqPrices,
    hasLiquidationRange: !!userPrices,
    llammaEndpoint: selectedChartKey === 'llamma',
  })

  const selectedLiqRange = useLiquidationRange({
    chartData: ohlcData,
    fallbackData: currentChart.oraclePriceData,
    currentPrices: userPrices,
    newPrices: newLiqPrices,
  })

  const coins: LlammaLiquidityCoins = useMemo(() => market && getTokens(market), [market])

  const { timeOption, setTimeOption, chartTimeSettings, chartInterval, timeUnit } = useChartTimeSettings()

  const refetchPricesData = useCallback(() => {
    void fetchOracleOhlcData(
      chainId,
      controllerAddress,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end,
    )
    void fetchLlammaOhlcData(
      chainId,
      marketId,
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
    chainId,
    marketId,
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

      void fetchMoreData(chainId, controllerAddress, poolAddress, chartInterval, timeUnit, +startTime, endTime)
    },
    [timeOption, fetchMoreData, chainId, controllerAddress, poolAddress, chartInterval, timeUnit],
  )

  // Determine chart status: loading > error (no data) > ready
  const chartStatus = isLoading || !market ? 'LOADING' : noDataAvailable ? 'ERROR' : 'READY'

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: true,
    chartHeight: DEFAULT_CHART_HEIGHT,
    chartStatus,
    ohlcData,
    oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption,
    selectedChartKey: selectedChartKey ?? '',
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
    isLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  }
}
