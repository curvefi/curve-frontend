import { Stack, useTheme } from '@mui/material'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
import { HEALTH_TOOLTIP } from './tooltips/health-tooltip'
import { HealthBar, getHealthValueColor, Health, LiquidationAlert } from './'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({
  health: { loading, value },
  liquidationAlert: { softLiquidation },
}: {
  health: Health
  liquidationAlert: LiquidationAlert
}) => {
  const theme = useTheme()
  const { title, body, placement } = HEALTH_TOOLTIP

  return (
    <Stack>
      <Stack gap={Spacing.xs}>
        <Stack direction="row" alignItems="flex-end" gap={Spacing.md.mobile}>
          <Metric
            label={title}
            value={value != null ? Number(value) : null}
            loading={loading}
            valueOptions={{ unit: 'none', color: getHealthValueColor({ health: decimal(value), theme }) }}
            valueTooltip={HEALTH_TOOLTIP}
            size="medium"
          />
          <Tooltip title={title} body={body} placement={placement}>
            <Stack sx={{ flex: 1 }}>
              <HealthBar health={value != null ? Number(value) : null} softLiquidation={softLiquidation} />
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}
