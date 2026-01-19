import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { t } from '@ui-kit/lib/i18n'
import type { ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import type { ChartSelection, PricesApiCoin } from '../types'

type UseDexChartListArgs = {
  coins: PricesApiCoin[]
  nCoins: number
  hasChartData: boolean
}

/**
 * Calculates all possible combinations without repetition of a certain size. Copied from `lodash.combinations`.
 * @param collection A collection of distinct values to calculate the groups from.
 * @param n A number as the size of each group.
 */
const combinations = <T>(collection: T[], n: number): T[][] => {
  const array = _.values(collection)
  if (array.length < n) {
    return []
  }
  const recur = (array: T[], n: number): T[][] => {
    if (--n < 0) {
      return [[]]
    }
    const combinations: T[][] = []
    array = array.slice()
    while (array.length - n) {
      const value = array.shift()!
      recur(array, n).forEach((combination) => {
        combination.unshift(value)
        combinations.push(combination)
      })
    }
    return combinations
  }
  return recur(array, n)
}

const buildChartCombinations = (coins: PricesApiCoin[], nCoins: number): PricesApiCoin[][] => {
  const baseCoins = coins.slice(0, nCoins)
  const extraCombinations = coins.slice(nCoins).map((item) => [item, baseCoins[0]])
  return [...extraCombinations, ...combinations(baseCoins, 2)]
}

const formatPairLabel = (main: PricesApiCoin, ref: PricesApiCoin) => `${ref.symbol} / ${main.symbol}`

const DEFAULT_CHART_SELECTION: ChartSelection = { type: 'lp-usd' }

/**
 * Manages chart selection for DEX pool charts.
 * Handles the generation of chart combinations from pool coins and provides
 * flip functionality to swap the token order in each chart pair (for none LP token charts).
 */
export const useDexChartList = ({ coins, nCoins, hasChartData }: UseDexChartListArgs) => {
  const [selectedChart, setSelectedChart] = useState<ChartSelection>(DEFAULT_CHART_SELECTION)

  const chartCombinations = useMemo(() => buildChartCombinations(coins, nCoins), [coins, nCoins])

  // Find which pair index matches the selected chart
  const selectedPairIndex =
    selectedChart.type === 'pair'
      ? chartCombinations.findIndex(
          ([main, ref]) =>
            (main.address === selectedChart.mainToken.address && ref.address === selectedChart.refToken.address) ||
            (main.address === selectedChart.refToken.address && ref.address === selectedChart.mainToken.address),
        )
      : -1

  const selectedChartKey =
    selectedChart.type === 'lp-usd'
      ? 'lp-usd'
      : selectedChart.type === 'lp-token'
        ? 'lp-token'
        : `pair-${selectedPairIndex}`

  const selectChartList: ChartSelections[] = useMemo(() => {
    if (!hasChartData) return []

    return [
      {
        activeTitle: t`LP Token (USD)`,
        label: t`LP Token (USD)`,
        key: 'lp-usd',
      },
      {
        activeTitle: t`LP Token (${coins[0]?.symbol ?? ''})`,
        label: t`LP Token (${coins[0]?.symbol ?? ''})`,
        key: 'lp-token',
      },
      ...chartCombinations.map(([mainToken, refToken], index) => {
        // Use flipped tokens if this pair is selected
        const isSelected = selectedPairIndex === index && selectedChart.type === 'pair'
        const label = isSelected
          ? formatPairLabel(selectedChart.mainToken, selectedChart.refToken)
          : formatPairLabel(mainToken, refToken)
        return { activeTitle: label, label, key: `pair-${index}` }
      }),
    ]
  }, [coins, chartCombinations, hasChartData, selectedPairIndex, selectedChart])

  const handleSelectChart = useCallback(
    (key: string) => {
      if (key === 'lp-usd') {
        setSelectedChart({ type: 'lp-usd' })
      } else if (key === 'lp-token') {
        setSelectedChart({ type: 'lp-token', symbol: coins[0]?.symbol ?? '' })
      } else if (key.startsWith('pair-')) {
        const index = parseInt(key.replace('pair-', ''), 10)
        const [mainToken, refToken] = chartCombinations[index]
        setSelectedChart({ type: 'pair', mainToken, refToken })
      }
    },
    [coins, chartCombinations],
  )

  const flipChart = useMemo(() => {
    if (selectedChart.type !== 'pair') return undefined
    return () =>
      setSelectedChart((prev) =>
        prev.type === 'pair' ? { type: 'pair', mainToken: prev.refToken, refToken: prev.mainToken } : prev,
      )
  }, [selectedChart.type])

  return {
    chartCombinations,
    selectChartList,
    selectedChart,
    selectedChartKey,
    setSelectedChart: handleSelectChart,
    flipChart,
  }
}
