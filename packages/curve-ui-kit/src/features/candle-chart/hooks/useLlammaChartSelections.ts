import { useCallback, useEffect, useMemo, useState } from 'react'
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
  marketTokens: TokenLabels
}

/**
 * Manages chart selection between Oracle and LLAMMA price data sources.
 * Automatically selects an available chart if the current selection has no data.
 */
export const useLlammaChartSelections = ({
  oracleChart,
  llammaChart,
  oracleTokens,
  marketTokens,
}: UseLlammaChartSelectionsProps) => {
  const [selectedChartKey, setSelectedChartKey] = useState<ChartKey>('oracle')

  const isLoading = oracleChart.fetchStatus === 'LOADING' || llammaChart.fetchStatus === 'LOADING'

  const selectChartList = useMemo((): ChartSelections[] => {
    const options: ChartSelections[] = []

    if (oracleChart.hasData) {
      const label = oracleTokens ? t`${oracleTokens.collateralSymbol} / ${oracleTokens.borrowedSymbol}` : t`Oracle`
      options.push({ activeTitle: label, label, key: 'oracle' })
    }

    if (llammaChart.hasData) {
      const label = marketTokens
        ? t`${marketTokens.collateralSymbol} / ${marketTokens.borrowedSymbol} (LLAMMA)`
        : t`LLAMMA`
      options.push({ activeTitle: label, label, key: 'llamma' })
    }

    return options
  }, [oracleChart.hasData, llammaChart.hasData, oracleTokens, marketTokens])

  // Auto-switch to available chart when current selection has no data
  useEffect(() => {
    if (isLoading || selectChartList.length === 0) return

    const isCurrentAvailable = selectedChartKey === 'oracle' ? oracleChart.hasData : llammaChart.hasData
    if (!isCurrentAvailable) {
      setSelectedChartKey(selectChartList[0].key as ChartKey)
    }
  }, [isLoading, selectedChartKey, oracleChart.hasData, llammaChart.hasData, selectChartList])

  const setSelectedChart = useCallback((key: string) => {
    if (key === 'oracle' || key === 'llamma') {
      setSelectedChartKey(key)
    }
  }, [])

  return {
    selectChartList,
    selectedChartKey: isLoading ? undefined : selectedChartKey,
    setSelectedChart,
    isLoading,
  }
}
