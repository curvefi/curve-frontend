import { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { HealthAndBufferBar } from '..'
import { HEALTH_TOOLTIP } from '../tooltips'
import { getHealthDetailsState, getHealthColor } from './utils'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({ params }: { params: UserMarketParams }) => {
  const theme = useTheme()
  const healthQuery = useUserHealthValues(params)
  const { state } = getHealthDetailsState(healthQuery.data)

  return (
    <Stack sx={{ gap: Spacing.xs }}>
      <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md }}>
        <Metric
          category="llamalend.positionHealth"
          label={HEALTH_TOOLTIP.shortTitle}
          value={mapQuery(healthQuery, data => data.health)}
          valueOptions={{
            unit: 'percentage',
            color: getHealthColor(state)(theme),
          }}
          valueTooltip={HEALTH_TOOLTIP}
        />
        <Stack sx={{ flex: 1 }}>
          <HealthAndBufferBar healthQuery={q(healthQuery)} />
        </Stack>
      </Stack>
    </Stack>
  )
}
