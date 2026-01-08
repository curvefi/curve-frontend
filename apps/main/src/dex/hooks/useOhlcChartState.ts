import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import { useChartTimeSettings } from '@ui-kit/features/candle-chart/hooks/useChartTimeSettings'
import type { PricesApiCoin, PricesApiPool } from '@ui-kit/features/candle-chart/types'
import {
  calculateChartCombinations,
  getThreeHundredResultsAgo,
  subtractTimeUnit,
} from '@ui-kit/features/candle-chart/utils'
import { t } from '@ui-kit/lib/i18n'
import type { ChartSelections } from '@ui-kit/shared/ui/ChartHeader'

type UseOhlcChartStateArgs = {
  rChainId: ChainId
  pricesApiPoolData: PricesApiPool
}

export const useOhlcChartState = ({ rChainId, pricesApiPoolData }: UseOhlcChartStateArgs) => {
  const chartOhlcData = useStore((state) => state.pools.pricesApiState.chartOhlcData)
  const chartStatus = useStore((state) => state.pools.pricesApiState.chartStatus)
  const timeOption = useStore((state) => state.pools.pricesApiState.timeOption)
  const tradesTokens = useStore((state) => state.pools.pricesApiState.tradesTokens)
  const refetchingCapped = useStore((state) => state.pools.pricesApiState.refetchingCapped)
  const lastFetchEndTime = useStore((state) => state.pools.pricesApiState.lastFetchEndTime)
  const setChartTimeOption = useStore((state) => state.pools.setChartTimeOption)
  const fetchPricesApiCharts = useStore((state) => state.pools.fetchPricesApiCharts)
  const fetchPricesApiActivity = useStore((state) => state.pools.fetchPricesApiActivity)
  const fetchMorePricesApiCharts = useStore((state) => state.pools.fetchMorePricesApiCharts)

  const [selectedChartIndex, setChartSelectedIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState<boolean[]>([])

  const chartCombinations: PricesApiCoin[][] = useMemo(() => {
    const coins = pricesApiPoolData.coins.slice(0, pricesApiPoolData.n_coins)
    const combinationsArray = calculateChartCombinations(coins, 2)
    const extraCombinations = pricesApiPoolData.coins.slice(pricesApiPoolData.n_coins).map((item) => [item, coins[0]])

    const combinedArray = [...combinationsArray]
    combinedArray.splice(0, 0, ...extraCombinations)

    return combinedArray
  }, [pricesApiPoolData.coins, pricesApiPoolData.n_coins])

  const { chartTimeSettings, chartInterval, timeUnit } = useChartTimeSettings(timeOption)

  const fetchCharts = useCallback(() => {
    fetchPricesApiCharts(
      rChainId,
      selectedChartIndex,
      pricesApiPoolData.address,
      chartInterval,
      timeUnit,
      chartTimeSettings.end,
      chartTimeSettings.start,
      chartCombinations,
      isFlipped,
    )
  }, [
    chartCombinations,
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    fetchPricesApiCharts,
    isFlipped,
    pricesApiPoolData.address,
    rChainId,
    selectedChartIndex,
    timeUnit,
  ])

  const refetchPricesData = useCallback(() => {
    fetchCharts()
    fetchPricesApiActivity(rChainId, pricesApiPoolData.address, chartCombinations)
  }, [chartCombinations, fetchCharts, fetchPricesApiActivity, pricesApiPoolData.address, rChainId])

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTimeParam: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTimeParam)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      fetchMorePricesApiCharts(
        rChainId,
        selectedChartIndex,
        pricesApiPoolData.address,
        chartInterval,
        timeUnit,
        +startTime,
        endTime,
        chartCombinations,
        isFlipped,
      )
    },
    [
      chartCombinations,
      chartInterval,
      fetchMorePricesApiCharts,
      isFlipped,
      pricesApiPoolData.address,
      rChainId,
      selectedChartIndex,
      timeOption,
      timeUnit,
    ],
  )

  useEffect(() => {
    if (chartCombinations.length === 0) return
    const flippedList = new Array(chartCombinations.length).fill(false)
    setIsFlipped(flippedList)
  }, [chartCombinations.length])

  const selectChartList: ChartSelections[] = useMemo(() => {
    if (chartOhlcData.length === 0) return []

    return [
      {
        activeTitle: t`LP Token (USD)`,
        label: t`LP Token (USD)`,
        key: 'lp-token-usd',
      },
      {
        activeTitle: t`LP Token (${pricesApiPoolData.coins[0].symbol})`,
        label: t`LP Token (${pricesApiPoolData.coins[0].symbol})`,
        key: `lp-token-${pricesApiPoolData.coins[0].symbol}`,
      },
      ...chartCombinations.map((chart, index) => {
        const mainTokenSymbol = isFlipped[index] ? chart[1].symbol : chart[0].symbol
        const referenceTokenSymbol = isFlipped[index] ? chart[0].symbol : chart[1].symbol
        const label = `${referenceTokenSymbol} / ${mainTokenSymbol}`

        return {
          activeTitle: label,
          label,
          key: `${referenceTokenSymbol}-${mainTokenSymbol}-${index}`,
        }
      }),
    ]
  }, [pricesApiPoolData.coins, chartCombinations, isFlipped, chartOhlcData.length])

  const setSelectedChart = useCallback(
    (key: string) => {
      const index = selectChartList.findIndex((chart) => chart.key === key)
      if (index !== -1) setChartSelectedIndex(index)
    },
    [selectChartList],
  )

  const flipChart = useCallback(() => {
    const updatedList = isFlipped.map((_item, index) =>
      index === selectedChartIndex - 2 ? !isFlipped[selectedChartIndex - 2] : isFlipped[selectedChartIndex - 2],
    )
    setIsFlipped(updatedList)
  }, [isFlipped, selectedChartIndex])

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: false,
    chartStatus,
    chartHeight: DEFAULT_CHART_HEIGHT,
    ohlcData: chartOhlcData,
    selectChartList,
    selectedChartIndex,
    timeOption,
    refetchPricesData,
    refetchingCapped,
    fetchMoreChartData,
    lastFetchEndTime,
  }

  const isLoading = chartStatus === 'LOADING'

  return {
    chartCombinations,
    tradesTokens,
    isLoading,
    setSelectedChart,
    setChartTimeOption,
    flipChart,
    ohlcChartProps,
  }
}
