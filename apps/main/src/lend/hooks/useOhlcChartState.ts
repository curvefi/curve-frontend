import { useCallback, useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useStore } from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { getTokens } from '@/llamalend/llama.utils'
import { useUserPrices } from '@/llamalend/queries/user'
import type { Decimal } from '@primitives/decimal.utils'
import {
  useChartLegendToggles,
  useChartTimeSettings,
  useLiquidationRange,
  useLlammaChartSelections,
} from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import type { FetchingStatus } from '@ui-kit/features/candle-chart/types'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui-kit/features/candle-chart/utils'
import type { Range } from '@ui-kit/types/util'

export type LendingMarketTokens = ReturnType<typeof getTokens> | undefined

type UseOhlcChartStateProps = {
  rChainId: ChainId
  rOwmId: string
  previewPrices: Range<Decimal> | undefined
}

const useLegacyChartPrices = () => {
  const borrowMoreActiveKey = useStore((state) => state.loanBorrowMore.activeKey)
  const loanRepayActiveKey = useStore((state) => state.loanRepay.activeKey)
  const loanCollateralAddActiveKey = useStore((state) => state.loanCollateralAdd.activeKey)
  const loanCollateralRemoveActiveKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const loanCreateLeverageDetailInfo = useStore((state) => state.loanCreate.detailInfoLeverage[activeKey])
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
  return useMemo(() => {
    if (repayLeveragePrices?.length) return repayLeveragePrices
    if (removeCollateralPrices?.length) return removeCollateralPrices
    if (addCollateralPrices?.length) return addCollateralPrices
    if (repayLoanPrices?.length) return repayLoanPrices
    if (borrowMorePrices?.length) return borrowMorePrices
    if (formValues.n && liqRangesMapper?.[formValues.n]?.prices?.length) {
      const prices = liqRangesMapper[formValues.n].prices
      return [prices[1], prices[0]]
    }
    return loanCreateLeverageDetailInfo?.prices ?? null
  }, [
    repayLeveragePrices,
    removeCollateralPrices,
    addCollateralPrices,
    repayLoanPrices,
    borrowMorePrices,
    formValues.n,
    liqRangesMapper,
    loanCreateLeverageDetailInfo,
  ]) as Range<Decimal> | undefined
}

export const useOhlcChartState = ({ rChainId, rOwmId, previewPrices }: UseOhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const storePreviewPrices = useLegacyChartPrices()
  const { data: userPrices } = useUserPrices({
    chainId: rChainId,
    marketId: rOwmId,
    userAddress,
  })
  const market = useOneWayMarket(rChainId, rOwmId).data
  const oraclePoolFetchStatus = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.fetchStatus)
  const oraclePoolData = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.data)
  const oraclePoolOraclePriceData = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.oraclePriceData)
  const oraclePoolCollateralSymbol = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.collateralToken.symbol)
  const oraclePoolBorrowedSymbol = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.borrowedToken.symbol)
  const oraclePoolRefetchingCapped = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.refetchingCapped)
  const oraclePoolLastFetchEndTime = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc.lastFetchEndTime)
  const llammaFetchStatus = useStore((state) => state.ohlcCharts.chartLlammaOhlc.fetchStatus)
  const llammaOraclePriceData = useStore((state) => state.ohlcCharts.chartLlammaOhlc.oraclePriceData)
  const llammaRefetchingCapped = useStore((state) => state.ohlcCharts.chartLlammaOhlc.refetchingCapped)
  const llammaLastFetchEndTime = useStore((state) => state.ohlcCharts.chartLlammaOhlc.lastFetchEndTime)
  const fetchLlammaOhlcData = useStore((state) => state.ohlcCharts.fetchLlammaOhlcData)
  const fetchOraclePoolOhlcData = useStore((state) => state.ohlcCharts.fetchOraclePoolOhlcData)
  const fetchMoreData = useStore((state) => state.ohlcCharts.fetchMoreData)
  const resetOhlcState = useStore((state) => state.ohlcCharts.resetState)
  const priceInfo = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices ?? null)

  const { oraclePrice } = priceInfo ?? {}

  // Token symbols for chart labels (oracle tokens comes from API response)
  const oracleTokens = useMemo(
    () =>
      oraclePoolCollateralSymbol && oraclePoolBorrowedSymbol
        ? { collateralSymbol: oraclePoolCollateralSymbol, borrowedSymbol: oraclePoolBorrowedSymbol }
        : null,
    [oraclePoolCollateralSymbol, oraclePoolBorrowedSymbol],
  )

  const { selectChartList, selectedChartKey, isLoading } = useLlammaChartSelections({
    oracleChart: { fetchStatus: oraclePoolFetchStatus, hasData: oraclePoolData.length > 0 },
    llammaChart: { fetchStatus: llammaFetchStatus, hasData: llammaOraclePriceData.length > 0 },
    oracleTokens,
  })

  const isLlamma = selectedChartKey === 'llamma'
  // we no longer want to use the llamma endpoint for it's ohlc data as it's deemed too spotty, pass empty array for ohlc data when llamma is selected
  const ohlcData = isLlamma ? [] : oraclePoolData
  const currentOraclePriceData = isLlamma ? llammaOraclePriceData : oraclePoolOraclePriceData
  const currentRefetchingCapped = isLlamma ? llammaRefetchingCapped : oraclePoolRefetchingCapped
  const currentLastFetchEndTime = isLlamma ? llammaLastFetchEndTime : oraclePoolLastFetchEndTime
  const noDataAvailable = !isLoading && currentOraclePriceData.length === 0

  const oraclePriceData = useMemo(() => {
    if (oraclePoolOraclePriceData.length > 0) return oraclePoolOraclePriceData
    // if the oracle data endpoint doesn't have oracle price data, there's a higher chance that it still exists in the llamma endpoint
    if (llammaOraclePriceData.length > 0) return llammaOraclePriceData
    return undefined
  }, [oraclePoolOraclePriceData, llammaOraclePriceData])

  const newLiqPrices = previewPrices ?? storePreviewPrices

  const { oraclePriceVisible, liqRangeCurrentVisible, liqRangeNewVisible, legendSets } = useChartLegendToggles({
    hasNewLiquidationRange: !!newLiqPrices,
    hasLiquidationRange: !!userPrices,
    llammaEndpoint: selectedChartKey === 'llamma',
  })

  const selectedLiqRange = useLiquidationRange({
    chartData: ohlcData,
    fallbackData: currentOraclePriceData,
    currentPrices: userPrices,
    newPrices: newLiqPrices,
  })

  const coins: LendingMarketTokens = useMemo(() => market && getTokens(market), [market])

  const { timeOption, setTimeOption, chartTimeSettings, chartInterval, timeUnit } = useChartTimeSettings()

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
    chartTimeSettings,
    fetchLlammaOhlcData,
    fetchOraclePoolOhlcData,
    market,
    rChainId,
    rOwmId,
    timeUnit,
  ])

  // Eagerly reset chart state as soon as the market identity changes, before the market entity resolves.
  // Without this, stale data from the previous market stays visible during the gap between navigation and fetch.
  useEffect(() => {
    resetOhlcState(rChainId)
  }, [rChainId, rOwmId, resetOhlcState])

  // Fetch chart data once the market entity has resolved (addresses are required for the API calls).
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

  // Determine chart status: loading > error (no data) > ready
  const chartStatus: FetchingStatus = isLoading ? 'LOADING' : noDataAvailable ? 'ERROR' : 'READY'

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
    refetchingCapped: currentRefetchingCapped,
    fetchMoreChartData,
    lastFetchEndTime: currentLastFetchEndTime,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice: oraclePrice,
  }

  return {
    coins,
    ohlcDataUnavailable: noDataAvailable,
    isLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  }
}
