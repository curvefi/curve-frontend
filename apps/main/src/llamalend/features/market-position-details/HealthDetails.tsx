import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { HEALTH_TOOLTIP } from './tooltips'
import { getHealthValueColor, HealthBar } from './'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({
  params,
  softLiquidation: { data: softLiquidation },
}: {
  params: UserMarketParams
  softLiquidation: QueryProp<boolean>
}) => {
  const theme = useTheme()
  const health = useUserHealthValue(params)
  const { title, body } = HEALTH_TOOLTIP

  return (
    <Stack>
      <Stack sx={{ gap: Spacing.xs }}>
        <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md.mobile }}>
          <Metric
            category="llamalend.positionHealth"
            label={title}
            value={q(health)}
            valueOptions={{ unit: 'none', color: getHealthValueColor({ health: decimal(health.data), theme }) }}
            valueTooltip={HEALTH_TOOLTIP}
          />
          <Tooltip title={title} body={body}>
            <Stack sx={{ flex: 1 }}>
              <HealthBar health={health.data && +health.data} softLiquidation={softLiquidation} />
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}
