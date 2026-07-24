import { useLegacyUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
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
            category="llamalend.positionHealth"
            label={title}
            value={healthQuery}
            valueOptions={{
              unit: 'none',
              color: getHealthValueColor({ health: decimal(health), theme }),
            }}
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
