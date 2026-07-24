import type { HealthQuery } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { HEALTH_FACTOR_TOOLTIP, HEALTH_TOOLTIP } from '../tooltips'
import { HealthAndBufferBar } from './HealthAndBufferBar'
import { getHealthDetailsState, getHealthColor } from './utils'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({ healthQuery }: { healthQuery: HealthQuery }) => {
  const theme = useTheme()
  const { state } = getHealthDetailsState(healthQuery.data)

  return (
    <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md }}>
      <Metric
        category="llamalend.positionHealth"
        label={HEALTH_TOOLTIP.shortTitle}
        value={mapQuery(healthQuery, data => data.healthFactor)}
        valueOptions={{
          abbreviate: false,
          color: getHealthColor(state)(theme),
          formatter: value => formatNumber(value, 'health'),
        }}
        valueTooltip={HEALTH_FACTOR_TOOLTIP}
      />
      <Stack sx={{ flex: 1 }}>
        <HealthAndBufferBar healthQuery={healthQuery} />
      </Stack>
    </Stack>
  )
}
