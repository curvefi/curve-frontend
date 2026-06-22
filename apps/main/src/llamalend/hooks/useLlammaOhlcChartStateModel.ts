import { useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useChartLegendToggles, useChartTimeSettings, useLiquidationRange } from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { useStableOhlcAnchorEnd } from '@ui-kit/features/candle-chart/hooks/useOhlcQueries'
import type { LpPriceOhlcDataFormatted, OraclePriceData } from '@ui-kit/features/candle-chart/types'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Range } from '@ui-kit/types/util'
import { useLlammaOhlcChartData } from './useLlammaOhlcChartData'

const { Height } = SizesAndSpaces

type LlammaOhlcChartStateModelParams = {
  chainKey: string | number
  controllerAddress: Address | undefined
  endpoint: Parameters<typeof useLlammaOhlcChartData>[0]['endpoint']
  llammaAddress: Address | undefined
  marketId: string | undefined
  network: Chain | undefined
  oraclePrice: string | undefined
  previewPrices: Range<Decimal> | undefined
  userPrices: Range<Decimal> | undefined
}

/**
 * Resolves chart display series.
 *
 * Oracle-pool is the only candle source. Its oracle line wins when present;
 * LLAMMA is only used as an oracle-line fallback. `isOracleLineOnly` means the
 * chart can only render the LLAMMA oracle line.
 */
const resolveLlammaChartSeries = ({
  oraclePoolCandles,
  oraclePoolOracleLine,
  llammaOracleLine,
}: {
  oraclePoolCandles: LpPriceOhlcDataFormatted[]
  oraclePoolOracleLine: OraclePriceData[]
  llammaOracleLine: OraclePriceData[]
}) => {
  const hasOraclePoolSeries = oraclePoolCandles.length > 0 || oraclePoolOracleLine.length > 0
  const hasLlammaOracleLine = llammaOracleLine.length > 0
  const isOracleLineOnly = !hasOraclePoolSeries && hasLlammaOracleLine
  const hasAnySeries = hasOraclePoolSeries || hasLlammaOracleLine
  const selectedOracleLine = oraclePoolOracleLine.length > 0 ? oraclePoolOracleLine : llammaOracleLine

  return {
    hasAnySeries,
    isOracleLineOnly,
    liquidationFallbackData: isOracleLineOnly ? llammaOracleLine : oraclePoolOracleLine,
    ohlcData: oraclePoolCandles,
    oraclePriceData: selectedOracleLine.length > 0 ? selectedOracleLine : undefined,
  }
}

export const useLlammaOhlcChartStateModel = ({
  chainKey,
  controllerAddress,
  endpoint,
  llammaAddress,
  marketId,
  network,
  oraclePrice,
  previewPrices,
  userPrices,
}: LlammaOhlcChartStateModelParams) => {
  const { timeOption, setTimeOption, chartInterval, timeUnit } = useChartTimeSettings()
  const { anchorEnd, isAnchorEndReady } = useStableOhlcAnchorEnd(chainKey, marketId ?? '', timeOption)

  const enabled = !!network && !!controllerAddress && isAnchorEndReady
  const {
    oraclePoolsChartQuery,
    oraclePriceFallbackQuery,
    oracleTokens,
    refetch,
    fetchMore,
    isWaitingForFallbackChartData,
    isLlammaFallbackEnabled,
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
    enabled,
  })
  const oraclePoolCandles = oraclePoolsChartQuery.data?.ohlcData ?? []
  const oraclePoolOracleLine = oraclePoolsChartQuery.data?.oraclePriceData ?? []
  const llammaOracleLine = oraclePriceFallbackQuery.data ?? []
  const { hasAnySeries, isOracleLineOnly, liquidationFallbackData, ohlcData, oraclePriceData } =
    resolveLlammaChartSeries({
      oraclePoolCandles,
      oraclePoolOracleLine,
      llammaOracleLine,
    })

  const isLoading = !enabled || oraclePoolsChartQuery.isLoading || isWaitingForFallbackChartData
  const selectedChartKey = isLoading ? undefined : isOracleLineOnly ? 'llamma' : 'oracle'
  const currentError = hasAnySeries ? null : (oraclePriceFallbackQuery.error ?? oraclePoolsChartQuery.error)
  const noDataAvailable = !isLoading && !currentError && !hasAnySeries
  const emptyMessage = t`No ${isLlammaFallbackEnabled ? 'LLAMMA' : 'oracle'} OHLC data found. Data may be unavailable for this market.`

  const oraclePoolLabel = oracleTokens
    ? t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}`
    : t`Oracle`
  const chartLabel = isOracleLineOnly ? t`Oracle price` : oraclePoolLabel
  const selectChartList = useMemo(
    () => [{ activeTitle: chartLabel, label: chartLabel, key: selectedChartKey ?? 'oracle' }],
    [chartLabel, selectedChartKey],
  )

  const { oraclePriceVisible, liqRangeCurrentVisible, liqRangeNewVisible, legendSets } = useChartLegendToggles({
    hasNewLiquidationRange: !!previewPrices,
    hasLiquidationRange: !!userPrices,
    llammaEndpoint: isOracleLineOnly,
  })
  const shouldFetchFallbackOracleLine = isOracleLineOnly || (oraclePriceVisible && oraclePoolOracleLine.length === 0)

  const selectedLiqRange = useLiquidationRange({
    chartData: ohlcData,
    fallbackData: liquidationFallbackData,
    currentPrices: userPrices,
    newPrices: previewPrices,
  })

  const ohlcChartProps: OhlcChartProps = {
    hideCandleSeriesLabel: true,
    chartHeight: Height.chart,
    isLoading,
    isEmpty: noDataAvailable,
    emptyMessage,
    error: currentError,
    ohlcData,
    oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption,
    selectedChartKey,
    selectChartList,
    refetchPricesData: () => refetch({ oraclePool: !isOracleLineOnly, llamma: shouldFetchFallbackOracleLine }),
    fetchMoreChartData: () => fetchMore({ oraclePool: !isOracleLineOnly, llamma: shouldFetchFallbackOracleLine }),
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice: maybe(oraclePrice, Number),
  }

  return {
    ohlcChartProps,
    isLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
  }
}
