import { useCallback, useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import {
  useChartLegendToggles,
  useChartTimeSettings,
  useLiquidationRange,
  useLlammaChartSelections,
  useStableOhlcAnchorEnd,
} from '@ui-kit/features/candle-chart'
import type { OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
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
    llamma: { error: llammaError, isLoading: llammaIsLoading, oraclePriceData: llammaOraclePriceData },
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
  const oraclePoolHasData = oraclePoolData.length > 0 || oraclePoolOraclePriceData.length > 0

  const { selectChartList, selectedChartKey, isLoading } = useLlammaChartSelections({
    oracleChart: { hasData: oraclePoolHasData, isLoading: oraclePoolIsLoading },
    llammaChart: { hasData: llammaOraclePriceData.length > 0, isLoading: llammaIsLoading },
    oracleTokens,
  })

  const isLlamma = selectedChartKey === 'llamma'
  const currentError = isLlamma ? llammaError : oraclePoolError
  // The LLAMMA OHLC candles are intentionally hidden because that endpoint is too sparse.
  const ohlcData = isLlamma ? [] : oraclePoolData
  const currentOraclePriceData = isLlamma ? llammaOraclePriceData : oraclePoolOraclePriceData
  const currentChartHasData = isLlamma ? llammaOraclePriceData.length > 0 : oraclePoolHasData
  const noDataAvailable = enabled && !isLoading && !currentError && !currentChartHasData

  const oraclePriceData = useMemo(() => {
    if (oraclePoolOraclePriceData.length > 0) return oraclePoolOraclePriceData
    // If oracle-pool data lacks oracle prices, the LLAMMA endpoint may still have the fallback line.
    if (llammaOraclePriceData.length > 0) return llammaOraclePriceData
    return undefined
  }, [oraclePoolOraclePriceData, llammaOraclePriceData])

  const newLiqPrices = previewPrices ?? legacyPreviewPrices

  const { oraclePriceVisible, liqRangeCurrentVisible, liqRangeNewVisible, legendSets } = useChartLegendToggles({
    hasNewLiquidationRange: !!newLiqPrices,
    hasLiquidationRange: !!userPrices,
    llammaEndpoint: selectedChartKey === 'llamma',
  })
  const needsLlammaFallbackLine = oraclePriceVisible && oraclePoolOraclePriceData.length === 0
  const neededHistoricalSelection = useMemo(
    () => ({
      oraclePool: !isLlamma,
      llamma: isLlamma || needsLlammaFallbackLine,
    }),
    [isLlamma, needsLlammaFallbackLine],
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
