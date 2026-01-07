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
  selectedChartKey: ChartKey
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
    if (isLoading) {
      return [{ activeTitle: t`Loading`, label: '-', key: 'loading' }]
    }

    const options: ChartSelections[] = []

    if (isOracleAvailable && oracleTokens) {
      options.push({
        activeTitle: t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}`,
        label: t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}`,
        key: 'oracle',
      })
    }

    if (isLlammaAvailable && llammaTokens) {
      options.push({
        activeTitle: t`${llammaTokens.collateralSymbol} / ${llammaTokens.borrowedSymbol} (LLAMMA)`,
        label: t`${llammaTokens.collateralSymbol} / ${llammaTokens.borrowedSymbol} (LLAMMA)`,
        key: 'llamma',
      })
    }

    return options
  }, [isLoading, isOracleAvailable, isLlammaAvailable, oracleTokens, llammaTokens])

  // Switch to an available chart if the currently selected one has no data
  useEffect(() => {
    if (isLoading) return

    const isCurrentAvailable = selectedChartKey === 'oracle' ? isOracleAvailable : isLlammaAvailable

    if (!isCurrentAvailable && selectChartList.length > 0) {
      const firstAvailableKey = selectChartList[0].key as ChartKey
      setSelectedChartKey(firstAvailableKey)
    }
  }, [isLoading, selectedChartKey, isOracleAvailable, isLlammaAvailable, selectChartList])

  const currentChart = selectedChartKey === 'oracle' ? oracleChart : llammaChart

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
    selectedChartKey,
    setSelectedChart,
    oraclePriceData,
    isLoading,
    noDataAvailable,
  }
}
