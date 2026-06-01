import { useNetworkByChain } from '@/dex/entities/networks'
import { getDexChartSelectionKey, useDexOhlcQuery } from '@/dex/queries/ohlc-chart.query'
import type { ChainId } from '@/dex/types/main.types'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Pool } from '@curvefi/prices-api/pools'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { useChartTimeSettings } from '@ui-kit/features/candle-chart/hooks/useChartTimeSettings'
import { useDexChartList } from '@ui-kit/features/candle-chart/hooks/useDexChartList'
import { useOhlcQueryAdapter, useStableOhlcAnchorEnd } from '@ui-kit/features/candle-chart/query-utils'
import type { LpPriceOhlcDataFormatted } from '@ui-kit/features/candle-chart/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Height } = SizesAndSpaces

type UseOhlcChartStateArgs = {
  rChainId: ChainId
  pricesApiPoolData: Pool
}

const selectDexOhlcData = (page: { ohlcData: LpPriceOhlcDataFormatted[] }) => page.ohlcData

export const useOhlcChartState = ({ rChainId, pricesApiPoolData }: UseOhlcChartStateArgs) => {
  const { data: networkData } = useNetworkByChain({ chainId: rChainId })
  const { timeOption, setTimeOption, chartInterval, timeUnit } = useChartTimeSettings()
  const networkId = networkData.id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined

  const { chartCombinations, selectChartList, selectedChart, selectedChartKey, setSelectedChart, flipChart } =
    useDexChartList({
      coins: pricesApiPoolData.coins,
      nCoins: pricesApiPoolData.numCoins,
    })

  const chartSelectionKey = getDexChartSelectionKey(selectedChart)
  const anchorEnd = useStableOhlcAnchorEnd(
    `${rChainId}:${pricesApiPoolData.address}:${chartSelectionKey}:${timeOption}`,
  )
  const chartQuery = useDexOhlcQuery({
    anchorEnd,
    chain: network,
    chartSelection: selectedChart,
    interval: chartInterval,
    poolAddress: pricesApiPoolData.address,
    timeOption,
    units: timeUnit,
  })
  const {
    isLoading,
    error,
    data: ohlcData,
    refetch,
    fetchMore,
  } = useOhlcQueryAdapter({ query: chartQuery, selectItems: selectDexOhlcData })

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: false,
    chartHeight: Height.chart,
    isLoading,
    error,
    ohlcData,
    selectChartList,
    selectedChartKey,
    timeOption,
    refetchPricesData: refetch,
    fetchMoreChartData: fetchMore,
  }

  return {
    chartCombinations,
    isLoading,
    setSelectedChart,
    setTimeOption,
    flipChart,
    ohlcChartProps,
  }
}
