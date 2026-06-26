import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { HealthAndBufferBar } from '..'
import { HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import { getState, getHealthColor } from './utils'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({ params }: { params: UserMarketParams }) => {
  const theme = useTheme()
  const healthQuery = useUserHealthValue(params)
  const { state, isHealthy } = getState(healthQuery.data)
  const { tooltip, value } = isHealthy
    ? { tooltip: HEALTH_TOOLTIP, value: mapQuery(healthQuery, d => d.health) }
    : { tooltip: LIQUIDATION_BUFFER_TOOLTIP, value: mapQuery(healthQuery, d => d.liquidationBuffer) }

  return (
    <Stack>
      <Stack sx={{ gap: Spacing.xs }}>
        <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md.mobile }}>
          <Metric
            label={tooltip.shortTitle}
            value={value}
            valueOptions={{
              unit: 'none',
              // TODO: fix metric color (either accept all string or return primitives "caution", "success" ...)
              color: getHealthColor(state)(theme),
            }}
            valueTooltip={tooltip}
            size="medium"
          />
          <Stack sx={{ flex: 1 }}>
            <HealthAndBufferBar healthQuery={q(healthQuery)} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
