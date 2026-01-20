import { useState, useCallback, useMemo } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'

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

  const legendSets: LegendItem[] = useMemo(
    () =>
      notFalsy(
        {
          label: t`Oracle Price`,
          line: { lineStroke: theme.palette.primary.main, dash: 'none' },
          toggled: oraclePriceVisible,
          onToggle: toggleOraclePriceVisible,
        },
        hasLiquidationRange && {
          label: t`Liquidation threshold`,
          line: { lineStroke: theme.design.Chart.Candles.Negative, dash: '4 4' },
          toggled: liqRangeCurrentVisible,
          onToggle: toggleLiqRangeCurrentVisible,
        },
        hasLiquidationRange && {
          label: t`Liquidation zone`,
          box: { fill: theme.design.Chart.LiquidationZone.Current },
          toggled: liqRangeCurrentVisible,
          onToggle: toggleLiqRangeCurrentVisible,
        },
        hasNewLiquidationRange && {
          label: t`New liquidation zone`,
          box: { fill: theme.design.Chart.LiquidationZone.Future },
          toggled: liqRangeNewVisible,
          onToggle: toggleLiqRangeNewVisible,
        },
      ),
    [
      theme.palette.primary.main,
      theme.design.Chart.Candles.Negative,
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
    ],
  )

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
