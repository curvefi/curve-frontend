import { useLegacyUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import type { UserMarketParams } from '@evm-ui/lib/model'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { decimal } from '@evm-ui/utils'
import { Stack, useTheme } from '@mui/material'
import { type QueryProp } from '@ui/features/queries/util'
import { getHealthValueColor, HealthBar } from '..'
import { LEGACY_HEALTH_TOOLTIP } from '../tooltips'

const { Spacing } = SizesAndSpaces

export const LegacyHealthDetails = ({
  params,
  softLiquidation: { data: softLiquidation },
}: {
  params: UserMarketParams
  softLiquidation: QueryProp<boolean>
}) => {
  const theme = useTheme()
  const healthQuery = useLegacyUserHealthValue(params)
  const health = healthQuery.data
  const { title, body } = LEGACY_HEALTH_TOOLTIP

  return (
    <Stack>
      <Stack sx={{ gap: Spacing.xs }}>
        <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md.mobile }}>
          <Metric
            category="llamalend.legacyPositionHealth"
            label={title}
            value={healthQuery}
            valueOptions={{ unit: 'none', color: getHealthValueColor({ health: decimal(health), theme }) }}
            valueTooltip={LEGACY_HEALTH_TOOLTIP}
          />
          <Tooltip title={title} body={body}>
            <Stack sx={{ flex: 1 }}>
              <HealthBar health={health && +health} softLiquidation={softLiquidation} />
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}
