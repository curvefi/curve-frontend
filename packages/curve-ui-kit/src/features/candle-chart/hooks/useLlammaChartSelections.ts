import { useEffect, useMemo, useState } from 'react'
import { t } from '@ui-kit/lib/i18n'
import type { ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import type { FetchingStatus } from '../types'

export type ChartKey = 'oracle' | 'llamma'

type ChartAvailability = {
  fetchStatus: FetchingStatus
  hasData: boolean
}

type TokenLabels =
  | {
      collateralSymbol: string
      borrowedSymbol: string
    }
  | null
  | undefined

type UseLlammaChartSelectionsProps = {
  oracleChart: ChartAvailability
  llammaChart: ChartAvailability
  oracleTokens: TokenLabels
}

/**
 * Manages chart selection between Oracle and LLAMMA price data sources.
 * Automatically selects an available chart if the current selection has no data.
 */
export const useLlammaChartSelections = ({ oracleChart, llammaChart, oracleTokens }: UseLlammaChartSelectionsProps) => {
  const [selectedChartKey, setSelectedChartKey] = useState<ChartKey>('oracle')

  const isLoading = oracleChart.fetchStatus === 'LOADING' || llammaChart.fetchStatus === 'LOADING'

  // Returns a single chart option: oracle (preferred) or llamma (fallback)
  const selectChartList = useMemo((): ChartSelections[] => {
    if (oracleChart.hasData) {
      const label = oracleTokens ? t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}` : t`Oracle`
      return [{ activeTitle: label, label, key: 'oracle' }]
    }

    const label = t`Oracle price`
    return [{ activeTitle: label, label, key: 'llamma' }]
  }, [oracleChart.hasData, oracleTokens])

  // Auto-switch to available chart when current selection has no data
  useEffect(() => {
    if (isLoading || selectChartList.length === 0) return

    const isCurrentAvailable = selectedChartKey === 'oracle' ? oracleChart.hasData : llammaChart.hasData
    if (!isCurrentAvailable) {
      setSelectedChartKey(selectChartList[0].key as ChartKey)
    }
  }, [isLoading, selectedChartKey, oracleChart.hasData, llammaChart.hasData, selectChartList])

  return {
    selectChartList,
    selectedChartKey: isLoading ? undefined : selectedChartKey,
    isLoading,
  }
}
