import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, Theme, useTheme } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { HealthAndBufferBar } from '..'
import { HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import {
  getHealthDetailsState,
  getHealthColor,
  getLiquidationBufferColor,
  HealthType,
  HealthAndBufferState,
} from './utils'

const { Spacing } = SizesAndSpaces

type HealthMetricConfig = {
  tooltip: typeof HEALTH_TOOLTIP | typeof LIQUIDATION_BUFFER_TOOLTIP
  value: MetricProps['value']
  getMetricColor: (state: HealthAndBufferState | undefined) => (theme: Theme) => string | undefined
}

export const HealthDetails = ({ params }: { params: UserMarketParams }) => {
  const theme = useTheme()
  const healthQuery = useUserHealthValue(params)
  const { state, type } = getHealthDetailsState(healthQuery.data)
  const { tooltip, value, getMetricColor } = (
    {
      health: { tooltip: HEALTH_TOOLTIP, value: mapQuery(healthQuery, d => d.health), getMetricColor: getHealthColor },
      liquidationBuffer: {
        tooltip: LIQUIDATION_BUFFER_TOOLTIP,
        value: mapQuery(healthQuery, d => d.liquidationBuffer),
        getMetricColor: getLiquidationBufferColor,
      },
    } satisfies Record<HealthType, HealthMetricConfig>
  )[type]

  return (
    <Stack sx={{ gap: Spacing.xs }}>
      <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md }}>
        <Metric
          category="llamalend.positionHealth"
          label={tooltip.shortTitle}
          value={value}
          valueOptions={{
            unit: 'percentage',
            color: getMetricColor(state)(theme),
          }}
          valueTooltip={tooltip}
        />
        <Stack sx={{ flex: 1 }}>
          <HealthAndBufferBar healthQuery={q(healthQuery)} />
        </Stack>
      </Stack>
    </Stack>
  )
}
