import { useCallback, useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import {
  useChartLegendToggles,
  useChartTimeSettings,
  useLiquidationRange,
  useStableOhlcAnchorEnd,
} from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Range } from '@ui-kit/types/util'
import { useLlammaOhlcChartData } from './useLlammaOhlcChartData'

const { Height } = SizesAndSpaces

type Endpoint = Parameters<typeof useLlammaOhlcChartData>[0]['endpoint']

type LlammaOhlcChartStateModelParams = {
  chainKey: string | number
  controllerAddress: string
  enabled?: boolean
  endpoint: Endpoint
  legacyPreviewPrices: Range<Decimal> | undefined
  llammaAddress: string
  marketId: string
  network: Chain | undefined
  oraclePrice: string | undefined
  previewPrices: Range<Decimal> | undefined
  userPrices: Range<Decimal> | undefined
}

export const useLlammaOhlcChartStateModel = ({
  chainKey,
  controllerAddress,
  enabled = true,
  endpoint,
  legacyPreviewPrices,
  llammaAddress,
  marketId,
  network,
  oraclePrice,
  previewPrices,
  userPrices,
}: LlammaOhlcChartStateModelParams) => {
  const { timeOption, setTimeOption, chartInterval, timeUnit } = useChartTimeSettings()
  const anchorKey = `${chainKey}:${marketId}:${controllerAddress}:${llammaAddress}:${timeOption}`
  const anchorEnd = useStableOhlcAnchorEnd(anchorKey)

  const {
    oraclePool: {
      error: oraclePoolError,
      isLoading: oraclePoolIsLoading,
      ohlcData: oraclePoolData,
      oraclePriceData: oraclePoolOraclePriceData,
    },
    llammaFallback: {
      error: llammaFallbackError,
      isLoading: llammaFallbackIsLoading,
      oraclePriceData: llammaFallbackOraclePriceData,
    },
    oracleTokens,
    refetch,
    fetchMore,
  } = useLlammaOhlcChartData({
    endpoint,
    chain: network,
    controller: controllerAddress,
    llamma: llammaAddress,
    oraclePrice,
    interval: chartInterval,
    timeOption,
    units: timeUnit,
    anchorEnd,
    enabled: enabled && !!network,
  })

  // Oracle-pool is primary because it has the richest candle data. LLAMMA is
  // only needed as an oracle-line fallback when oracle-pool does not supply
  // oracle price data.
  const hasOraclePoolData = oraclePoolData.length > 0 || oraclePoolOraclePriceData.length > 0
  const hasFallbackOracleLine = llammaFallbackOraclePriceData.length > 0
  const shouldUseFallbackChart = !hasOraclePoolData && hasFallbackOracleLine
  const hasChartData = hasOraclePoolData || hasFallbackOracleLine

  const isLoading = oraclePoolIsLoading || (!hasOraclePoolData && llammaFallbackIsLoading)
  const selectedChartKey = isLoading ? undefined : shouldUseFallbackChart ? 'llamma' : 'oracle'
  const currentError = hasChartData ? null : (llammaFallbackError ?? oraclePoolError)
  const noDataAvailable = enabled && !isLoading && !currentError && !hasChartData

  const ohlcData = shouldUseFallbackChart ? [] : oraclePoolData
  const selectedOraclePriceData =
    oraclePoolOraclePriceData.length > 0 ? oraclePoolOraclePriceData : llammaFallbackOraclePriceData
  const oraclePriceData = selectedOraclePriceData.length > 0 ? selectedOraclePriceData : undefined
  const currentOraclePriceData = shouldUseFallbackChart ? llammaFallbackOraclePriceData : oraclePoolOraclePriceData

  const oraclePoolLabel = oracleTokens
    ? t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}`
    : t`Oracle`
  const chartLabel = shouldUseFallbackChart ? t`Oracle price` : oraclePoolLabel
  const selectChartList = useMemo(
    () => [{ activeTitle: chartLabel, label: chartLabel, key: selectedChartKey ?? 'oracle' }],
    [chartLabel, selectedChartKey],
  )

  const newLiqPrices = previewPrices ?? legacyPreviewPrices

  const { oraclePriceVisible, liqRangeCurrentVisible, liqRangeNewVisible, legendSets } = useChartLegendToggles({
    hasNewLiquidationRange: !!newLiqPrices,
    hasLiquidationRange: !!userPrices,
    llammaEndpoint: shouldUseFallbackChart,
  })
  const shouldFetchFallbackOracleLine =
    shouldUseFallbackChart || (oraclePriceVisible && oraclePoolOraclePriceData.length === 0)
  const neededHistoricalSelection = useMemo(
    () => ({
      oraclePool: !shouldUseFallbackChart,
      llamma: shouldFetchFallbackOracleLine,
    }),
    [shouldFetchFallbackOracleLine, shouldUseFallbackChart],
  )
  const refetchPricesData = useCallback(() => refetch(neededHistoricalSelection), [neededHistoricalSelection, refetch])
  const fetchMoreChartData = useCallback(
    () => fetchMore(neededHistoricalSelection),
    [fetchMore, neededHistoricalSelection],
  )

  const selectedLiqRange = useLiquidationRange({
    chartData: ohlcData,
    fallbackData: currentOraclePriceData,
    currentPrices: userPrices,
    newPrices: newLiqPrices,
  })

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: true,
    chartHeight: Height.chart,
    isLoading,
    error: currentError,
    ohlcData,
    oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption,
    selectedChartKey: selectedChartKey ?? '',
    selectChartList,
    refetchPricesData,
    fetchMoreChartData,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice: oraclePrice,
  }

  return {
    ohlcChartProps,
    ohlcDataUnavailable: noDataAvailable,
    isLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
  }
}
