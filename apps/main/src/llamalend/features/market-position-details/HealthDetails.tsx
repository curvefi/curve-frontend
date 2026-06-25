import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import { useNewLlamalendHealth } from '@ui-kit/hooks/useFeatureFlags'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { HEALTH_TOOLTIP } from './tooltips'
import { getHealthValueColor, HealthAndBufferBar, HealthBar } from './'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({
  params,
  softLiquidation: { data: softLiquidation },
}: {
  params: UserMarketParams
  softLiquidation: QueryProp<boolean>
}) => {
  const theme = useTheme()
  const useNewHealth = useNewLlamalendHealth()
  const healthQuery = useUserHealthValue(params)
  const { legacyHealth, health, liquidationBuffer } = healthQuery.data ?? {}
  const { title, body } = HEALTH_TOOLTIP

  return (
    <Stack>
      <Stack sx={{ gap: Spacing.xs }}>
        <Stack direction="row" sx={{ alignItems: 'flex-end', gap: Spacing.md.mobile }}>
          <Metric
            label={title}
            value={mapQuery(healthQuery, d => d.legacyHealth)}
            valueOptions={{
              unit: 'none',
              color: getHealthValueColor({ health: decimal(legacyHealth), theme }),
            }}
            valueTooltip={HEALTH_TOOLTIP}
            size="medium"
          />
          <Tooltip title={title} body={body}>
            <Stack sx={{ flex: 1 }}>
              {useNewHealth ? (
                <HealthAndBufferBar
                  health={health}
                  liquidationBuffer={liquidationBuffer}
                  softLiquidation={softLiquidation}
                />
              ) : (
                <HealthBar health={legacyHealth && +legacyHealth} softLiquidation={softLiquidation} />
              )}
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}
