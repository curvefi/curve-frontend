import { useNetworkByChain } from '@/dex/entities/networks'
import { getDexChartSelectionKey, useDexOhlcQuery } from '@/dex/queries/ohlc-chart.query'
import type { ChainId } from '@/dex/types/main.types'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Pool } from '@curvefi/prices-api/pools'
import type { OhlcChartProps } from '@evm-ui/features/candle-chart/ChartWrapper'
import { useChartTimeSettings } from '@evm-ui/features/candle-chart/hooks/useChartTimeSettings'
import { useDexChartList } from '@evm-ui/features/candle-chart/hooks/useDexChartList'
import { useOhlcQueryAdapter, useStableOhlcAnchorEnd } from '@evm-ui/features/candle-chart/hooks/useOhlcQueries'
import type { LpPriceOhlcDataFormatted } from '@evm-ui/features/candle-chart/types'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'

const { Height } = SizesAndSpaces

type UseOhlcChartStateArgs = {
  rChainId: ChainId
  pricesApiPoolData: Pool
}

const selectDexOhlcData = (page: { ohlcData: LpPriceOhlcDataFormatted[] }) => page.ohlcData

export const useOhlcChartState = ({ rChainId, pricesApiPoolData }: UseOhlcChartStateArgs) => {
  const { data: networkData } = useNetworkByChain({ chainId: rChainId })
  const { timeOption, setTimeOption, chartInterval, timeUnit } = useChartTimeSettings()
  const { chartCombinations, selectChartList, selectedChart, selectedChartKey, setSelectedChart, flipChart } =
    useDexChartList({
      coins: pricesApiPoolData.coins,
      nCoins: pricesApiPoolData.numCoins,
    })

  const { anchorEnd, isAnchorEndReady } = useStableOhlcAnchorEnd(
    rChainId,
    pricesApiPoolData.address,
    getDexChartSelectionKey(selectedChart),
    timeOption,
  )
  const chartQuery = useDexOhlcQuery({
    anchorEnd,
    chain: getBlockchainId(networkData.id),
    chartSelection: selectedChart,
    interval: chartInterval,
    poolAddress: pricesApiPoolData.address,
    timeOption,
    units: timeUnit,
    enabled: isAnchorEndReady,
  })
  const {
    isLoading: isQueryLoading,
    error,
    data: ohlcData,
    refetch,
    fetchMore,
  } = useOhlcQueryAdapter({ query: chartQuery, selectItems: selectDexOhlcData })
  const isLoading = !isAnchorEndReady || isQueryLoading
  const isEmpty = !isLoading && !error && ohlcData?.length === 0

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: false,
    chartHeight: Height.chart,
    isLoading,
    isEmpty,
    emptyMessage: t`No OHLC data found. Data may be unavailable for this pool.`,
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
