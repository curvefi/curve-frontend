import { useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useChartLegendToggles, useChartTimeSettings, useLiquidationRange } from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { useStableOhlcAnchorEnd } from '@ui-kit/features/candle-chart/query-utils'
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
  const anchorKey = `${chainKey}:${marketId}:${timeOption}`
  const anchorEnd = useStableOhlcAnchorEnd(anchorKey)
  const latestOraclePrice = oraclePrice ? Number(oraclePrice) : undefined

  const {
    oraclePoolsChartQuery,
    oraclePriceFallbackQuery,
    oracleTokens,
    refetch,
    fetchMore,
    isWaitingForFallbackChartData,
  } = useLlammaOhlcChartData({
    endpoint,
    chain: network,
    controller: controllerAddress,
    llamma: llammaAddress,
    oraclePrice: latestOraclePrice,
    interval: chartInterval,
    timeOption,
    units: timeUnit,
    anchorEnd,
    enabled: enabled && !!network,
  })
  const oraclePoolsOhlcData = oraclePoolsChartQuery.data?.ohlcData ?? []
  const oraclePoolsOraclePriceData = oraclePoolsChartQuery.data?.oraclePriceData ?? []
  const fallbackOraclePriceData = oraclePriceFallbackQuery.data ?? []

  // Oracle-pool is primary because it has the richest candle data. LLAMMA is
  // only needed as an oracle-line fallback when oracle-pool does not supply
  // oracle price data.
  const hasOraclePoolsData = oraclePoolsOhlcData.length > 0 || oraclePoolsOraclePriceData.length > 0
  const hasFallbackOracleLine = fallbackOraclePriceData.length > 0
  const shouldUseFallbackChart = !hasOraclePoolsData && hasFallbackOracleLine
  const hasChartData = hasOraclePoolsData || hasFallbackOracleLine

  const isLoading = oraclePoolsChartQuery.isLoading || isWaitingForFallbackChartData
  const selectedChartKey = isLoading ? undefined : shouldUseFallbackChart ? 'llamma' : 'oracle'
  const currentError = hasChartData ? null : (oraclePriceFallbackQuery.error ?? oraclePoolsChartQuery.error)
  const noDataAvailable = enabled && !isLoading && !currentError && !hasChartData

  const ohlcData = shouldUseFallbackChart ? [] : oraclePoolsOhlcData
  const selectedOraclePriceData =
    oraclePoolsOraclePriceData.length > 0 ? oraclePoolsOraclePriceData : fallbackOraclePriceData
  const oraclePriceData = selectedOraclePriceData.length > 0 ? selectedOraclePriceData : undefined
  const currentOraclePriceData = shouldUseFallbackChart ? fallbackOraclePriceData : oraclePoolsOraclePriceData

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
    shouldUseFallbackChart || (oraclePriceVisible && oraclePoolsOraclePriceData.length === 0)

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
    refetchPricesData: () => refetch({ oraclePool: !shouldUseFallbackChart, llamma: shouldFetchFallbackOracleLine }),
    fetchMoreChartData: () => fetchMore({ oraclePool: !shouldUseFallbackChart, llamma: shouldFetchFallbackOracleLine }),
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice,
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
