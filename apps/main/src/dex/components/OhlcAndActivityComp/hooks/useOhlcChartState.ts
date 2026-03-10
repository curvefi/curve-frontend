import { useCallback, useEffect } from 'react'
import { useStore } from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import type { Pool } from '@curvefi/prices-api/pools'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import { useChartTimeSettings } from '@ui-kit/features/candle-chart/hooks/useChartTimeSettings'
import { useDexChartList } from '@ui-kit/features/candle-chart/hooks/useDexChartList'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui-kit/features/candle-chart/utils'

type UseOhlcChartStateArgs = {
  rChainId: ChainId
  pricesApiPoolData: Pool
}

export const useOhlcChartState = ({ rChainId, pricesApiPoolData }: UseOhlcChartStateArgs) => {
  const chartOhlcData = useStore((state) => state.pools.pricesApiState.chartOhlcData)
  const chartStatus = useStore((state) => state.pools.pricesApiState.chartStatus)
  const refetchingCapped = useStore((state) => state.pools.pricesApiState.refetchingCapped)
  const lastFetchEndTime = useStore((state) => state.pools.pricesApiState.lastFetchEndTime)
  const fetchPricesApiCharts = useStore((state) => state.pools.fetchPricesApiCharts)
  const fetchMorePricesApiCharts = useStore((state) => state.pools.fetchMorePricesApiCharts)

  const { chartCombinations, selectChartList, selectedChart, selectedChartKey, setSelectedChart, flipChart } =
    useDexChartList({
      coins: pricesApiPoolData.coins,
      nCoins: pricesApiPoolData.numCoins,
      hasChartData: chartOhlcData.length > 0,
    })

  const { timeOption, setTimeOption, chartTimeSettings, chartInterval, timeUnit } = useChartTimeSettings()

  const fetchCharts = useCallback(() => {
    fetchPricesApiCharts(
      rChainId,
      selectedChart,
      pricesApiPoolData.address,
      chartInterval,
      timeUnit,
      chartTimeSettings.end,
      chartTimeSettings.start,
    )
  }, [
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    fetchPricesApiCharts,
    pricesApiPoolData.address,
    rChainId,
    selectedChart,
    timeUnit,
  ])

  const refetchPricesData = useCallback(() => {
    fetchCharts()
  }, [fetchCharts])

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTimeParam: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTimeParam)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      fetchMorePricesApiCharts(
        rChainId,
        selectedChart,
        pricesApiPoolData.address,
        chartInterval,
        timeUnit,
        +startTime,
        endTime,
      )
    },
    [chartInterval, fetchMorePricesApiCharts, pricesApiPoolData.address, rChainId, selectedChart, timeOption, timeUnit],
  )

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: false,
    chartStatus,
    chartHeight: DEFAULT_CHART_HEIGHT,
    ohlcData: chartOhlcData,
    selectChartList,
    selectedChartKey,
    timeOption,
    refetchPricesData,
    refetchingCapped,
    fetchMoreChartData,
    lastFetchEndTime,
  }

  const isLoading = chartStatus === 'LOADING'

  return {
    chartCombinations,
    isLoading,
    setSelectedChart,
    setTimeOption,
    flipChart,
    ohlcChartProps,
  }
}
