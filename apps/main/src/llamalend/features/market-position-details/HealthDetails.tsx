import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import { Stack, useTheme } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
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
  const { data: value, isLoading: loading, error } = useUserHealthValue(params)
  const { title, body } = HEALTH_TOOLTIP

  return (
    <Stack>
      <Stack gap={Spacing.xs}>
        <Stack direction="row" alignItems="flex-end" gap={Spacing.md.mobile}>
          <Metric
            label={title}
            value={value}
            loading={loading}
            error={error}
            valueOptions={{ unit: 'none', color: getHealthValueColor({ health: decimal(value), theme }) }}
            valueTooltip={HEALTH_TOOLTIP}
            size="medium"
          />
          <Tooltip title={title} body={body}>
            <Stack sx={{ flex: 1 }}>
              <HealthBar health={value && +value} softLiquidation={softLiquidation} />
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}
