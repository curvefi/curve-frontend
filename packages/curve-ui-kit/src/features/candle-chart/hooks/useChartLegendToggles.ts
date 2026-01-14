import { useState, useCallback, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/LegendSet'

type UseChartLegendTogglesOptions = {
  hasNewLiquidationRange?: boolean
  hasLiquidationRange?: boolean
}

/**
 * Hook for managing chart legend visibility toggles and generating legend sets.
 * Used to show/hide oracle price line and liquidation range overlays on OHLC charts in the lend and loan apps.
 */
export const useChartLegendToggles = ({
  hasNewLiquidationRange = false,
  hasLiquidationRange = false,
}: UseChartLegendTogglesOptions = {}) => {
  const theme = useTheme()

  const [oraclePriceVisible, setOraclePriceVisible] = useState(true)
  const [liqRangeCurrentVisible, setLiqRangeCurrentVisible] = useState(true)
  const [liqRangeNewVisible, setLiqRangeNewVisible] = useState(true)

  const toggleOraclePriceVisible = useCallback(() => setOraclePriceVisible((v) => !v), [])
  const toggleLiqRangeCurrentVisible = useCallback(() => setLiqRangeCurrentVisible((v) => !v), [])
  const toggleLiqRangeNewVisible = useCallback(() => setLiqRangeNewVisible((v) => !v), [])

  const legendSets: LegendItem[] = useMemo(() => {
    const baseLegends: LegendItem[] = [
      {
        label: t`Oracle Price`,
        line: { lineStroke: theme.palette.primary.main, dash: 'none' },
        toggled: oraclePriceVisible,
        onToggle: toggleOraclePriceVisible,
      },
    ]

    if (hasLiquidationRange) {
      baseLegends.push({
        label: t`Conversion zone`,
        box: { fill: theme.design.Chart.LiquidationZone.Current },
        toggled: liqRangeCurrentVisible,
        onToggle: toggleLiqRangeCurrentVisible,
      })
    }

    if (hasNewLiquidationRange) {
      baseLegends.push({
        label: t`New conversion zone`,
        box: { fill: theme.design.Chart.LiquidationZone.Future },
        toggled: liqRangeNewVisible,
        onToggle: toggleLiqRangeNewVisible,
      })
    }

    return baseLegends
  }, [
    theme.palette.primary.main,
    theme.design.Chart.LiquidationZone.Current,
    theme.design.Chart.LiquidationZone.Future,
    oraclePriceVisible,
    toggleOraclePriceVisible,
    hasLiquidationRange,
    hasNewLiquidationRange,
    liqRangeCurrentVisible,
    toggleLiqRangeCurrentVisible,
    liqRangeNewVisible,
    toggleLiqRangeNewVisible,
  ])

  return {
    oraclePriceVisible,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    toggleOraclePriceVisible,
    toggleLiqRangeCurrentVisible,
    toggleLiqRangeNewVisible,
    legendSets,
  }
}
