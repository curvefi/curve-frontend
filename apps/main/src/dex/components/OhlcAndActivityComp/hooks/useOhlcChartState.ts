import { useNetworkByChain } from '@/dex/entities/networks'
import { getDexChartSelectionKey, useDexOhlcQuery } from '@/dex/queries/ohlc-chart.query'
import type { ChainId } from '@/dex/types/main.types'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import type { Pool } from '@curvefi/prices-api/pools'
import { useChartTimeSettings } from '@evm-ui/features/candle-chart/hooks/useChartTimeSettings'
import { useDexChartList } from '@evm-ui/features/candle-chart/hooks/useDexChartList'
import { useOhlcQueryAdapter, useStableOhlcAnchorEnd } from '@evm-ui/features/candle-chart/hooks/useOhlcQueries'
import type { OhlcChartProps } from '@evm-ui/features/candle-chart/OhlcChart'
import type { LpPriceOhlcDataFormatted } from '@evm-ui/features/candle-chart/types'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Height } = SizesAndSpaces

type UseOhlcChartStateArgs = { chainId: ChainId; pricesApiPoolData: Pool }

const selectDexOhlcData = (page: { ohlcData: LpPriceOhlcDataFormatted[] }) => page.ohlcData

export const useOhlcChartState = ({ chainId, pricesApiPoolData }: UseOhlcChartStateArgs) => {
  const { data: networkData } = useNetworkByChain({ chainId })
  const { timeOption, setTimeOption, chartInterval, timeUnit } = useChartTimeSettings()
  const { chartCombinations, selectChartList, selectedChart, selectedChartKey, setSelectedChart, flipChart } =
    useDexChartList({ coins: pricesApiPoolData.coins, nCoins: pricesApiPoolData.numCoins })

  const { anchorEnd, isAnchorEndReady } = useStableOhlcAnchorEnd(
    chainId,
    pricesApiPoolData.address,
    getDexChartSelectionKey(selectedChart),
    timeOption,
  )
  const chartQuery = useDexOhlcQuery({
    anchorEnd,
    blockchainId: getPricesApiBlockchainId(networkData.blockchainId),
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

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: false,
    chartHeight: Height.chart.lg,
    series: q({ data: { ohlcData }, isLoading, error }),
    isEmpty: ohlcData?.length === 0,
    emptyState: { description: t`No OHLC data found. Data may be unavailable for this pool.` },
    selectChartList,
    selectedChartKey,
    timeOption,
    refetchPricesData: refetch,
    fetchMoreChartData: fetchMore,
  }

  return { chartCombinations, isLoading, setSelectedChart, setTimeOption, flipChart, ohlcChartProps }
}
