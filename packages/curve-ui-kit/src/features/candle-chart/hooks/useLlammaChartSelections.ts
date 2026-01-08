import { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@ui-kit/lib/i18n'
import type { ChartSelections } from '@ui-kit/shared/ui/ChartHeader'
import type { FetchingStatus, LpPriceOhlcDataFormatted, OraclePriceData } from '../types'

/** State for an OHLC chart data source */
export type ChartDataState = {
  fetchStatus: FetchingStatus
  dataDisabled: boolean
  data: LpPriceOhlcDataFormatted[]
  oraclePriceData: OraclePriceData[]
  refetchingCapped: boolean
  lastFetchEndTime: number
}

/** Token pair symbols for chart labels */
export type ChartOption = {
  collateralSymbol: string
  borrowedSymbol: string
}

export type ChartKey = 'oracle' | 'llamma'

type UseLlammaChartSelectionsProps = {
  oracleChart: ChartDataState
  llammaChart: ChartDataState
  oracleTokens: ChartOption | null
  llammaTokens: ChartOption | null
}

type UseLlammaChartSelectionsReturn = {
  currentChart: ChartDataState
  selectChartList: ChartSelections[]
  selectedChartKey: ChartKey | undefined
  setSelectedChart: (key: string) => void
  oraclePriceData: OraclePriceData[] | undefined
  isLoading: boolean
  noDataAvailable: boolean
}

/**
 * Manages chart selection between Oracle and LLAMMA price data sources.
 *
 * LLAMMA markets can have two price chart sources:
 * - Oracle: Price derived from oracle pools
 * - LLAMMA: Price from the LLAMMA AMM itself
 *
 * Not all markets have both sources available. This hook handles:
 * - Showing only charts that have data
 * - Automatically selecting an available chart if the current one has no data
 * - Providing unified loading and error states
 */
export const useLlammaChartSelections = ({
  oracleChart,
  llammaChart,
  oracleTokens,
  llammaTokens,
}: UseLlammaChartSelectionsProps): UseLlammaChartSelectionsReturn => {
  const [selectedChartKey, setSelectedChartKey] = useState<ChartKey>('oracle')

  const isOracleAvailable = oracleChart.data.length > 0
  const isLlammaAvailable = llammaChart.data.length > 0
  const isLoading = oracleChart.fetchStatus === 'LOADING' || llammaChart.fetchStatus === 'LOADING'

  const selectChartList: ChartSelections[] = useMemo(() => {
    const options: ChartSelections[] = []

    if (isOracleAvailable) {
      const oracleLabel = oracleTokens
        ? t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}`
        : t`Oracle`
      options.push({
        activeTitle: oracleLabel,
        label: oracleLabel,
        key: 'oracle',
      })
    }

    if (isLlammaAvailable) {
      const llammaLabel = llammaTokens
        ? t`${llammaTokens.collateralSymbol} / ${llammaTokens.borrowedSymbol} (LLAMMA)`
        : t`LLAMMA`
      options.push({
        activeTitle: llammaLabel,
        label: llammaLabel,
        key: 'llamma',
      })
    }

    return options
  }, [isOracleAvailable, isLlammaAvailable, oracleTokens, llammaTokens])

  // Switch to an available chart if the currently selected one has no data
  useEffect(() => {
    if (isLoading) return

    const isCurrentAvailable = selectedChartKey === 'oracle' ? isOracleAvailable : isLlammaAvailable

    if (!isCurrentAvailable && selectChartList.length > 0) {
      const firstAvailableKey = selectChartList[0].key as ChartKey
      setSelectedChartKey(firstAvailableKey)
    }
  }, [isLoading, selectedChartKey, isOracleAvailable, isLlammaAvailable, selectChartList])

  // Derive an effective key that's always valid for the current selectChartList.
  // This handles the timing gap before the useEffect can update selectedChartKey.
  const effectiveChartKey = useMemo((): ChartKey | undefined => {
    // During loading, no selection is shown (ChartHeader handles displaying "Loading")
    if (isLoading) return undefined

    // Check if the current selection is actually in the list
    const isInList = selectChartList.some((item) => item.key === selectedChartKey)
    if (isInList) return selectedChartKey

    // Fall back to the first available option
    const firstKey = selectChartList[0]?.key
    if (firstKey === 'oracle' || firstKey === 'llamma') return firstKey

    return selectedChartKey
  }, [isLoading, selectedChartKey, selectChartList])

  // Default to oracle chart during loading or when no selection
  const currentChart = effectiveChartKey === 'llamma' ? llammaChart : oracleChart

  const oraclePriceData = useMemo(() => {
    if (oracleChart.oraclePriceData.length > 0) return oracleChart.oraclePriceData
    if (llammaChart.oraclePriceData.length > 0) return llammaChart.oraclePriceData
    return undefined
  }, [llammaChart.oraclePriceData, oracleChart.oraclePriceData])

  const setSelectedChart = useCallback((key: string) => {
    if (key === 'oracle' || key === 'llamma') {
      setSelectedChartKey(key)
    }
  }, [])

  const noDataAvailable = !isLoading && !isOracleAvailable && !isLlammaAvailable

  return {
    currentChart,
    selectChartList,
    selectedChartKey: effectiveChartKey,
    setSelectedChart,
    oraclePriceData,
    isLoading,
    noDataAvailable,
  }
}
