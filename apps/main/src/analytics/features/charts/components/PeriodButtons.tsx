import type { Period } from '@/analytics/features/charts/types'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

const DEFAULT_PERIODS: Period[] = ['7d', '1m', '3m', '6m', '1y']

/**
 * PeriodButtons component for selecting time period in analytics charts.
 * Displays a group of toggle buttons where exactly one must always be selected.
 *
 * @param period - Currently selected period
 * @param periods - Array of periods to display (defaults to all available periods)
 * @param onPeriod - Callback fired when a different period is selected
 */
export const PeriodButtons = ({
  period,
  periods = DEFAULT_PERIODS,
  onPeriod,
}: {
  period: Period
  periods?: Period[]
  onPeriod: (newPeriod: Period) => void
}) => (
  <ToggleButtonGroup
    value={period}
    exclusive
    onChange={(_, newPeriod) => {
      newPeriod != null && onPeriod(newPeriod)
    }}
    size="extraSmall"
  >
    {periods.map((p) => (
      <ToggleButton key={p} value={p} sx={{ textTransform: 'uppercase' }}>
        {p}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
)
