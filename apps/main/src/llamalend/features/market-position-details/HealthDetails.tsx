import { Stack, Typography, useTheme } from '@mui/material'
import { useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
import { HealthBar, getHealthValueColor, Health, LiquidationAlert, LlamaMonitorBotLinkButton } from './'

const { Spacing } = SizesAndSpaces

export const HealthDetails = ({
  health: { loading, value },
  liquidationAlert: { softLiquidation },
}: {
  health: Health
  liquidationAlert: LiquidationAlert
}) => {
  const theme = useTheme()
  const showPageHeader = useIntegratedLlamaHeader()
  return (
    <Stack>
      <Stack gap={Spacing.xs}>
        <Stack direction="row" alignItems="flex-end" gap={Spacing.md.mobile}>
          <Metric
            label={t`Health`}
            value={Number(value)}
            loading={loading}
            valueOptions={{ unit: 'none', color: getHealthValueColor({ health: decimal(value), theme }) }}
            size="medium"
          />
          <HealthBar health={Number(value)} softLiquidation={softLiquidation} sx={{ flex: 1 }} />
        </Stack>
        <Stack
          flexDirection={{ mobile: 'column', tablet: 'row' }}
          gap={Spacing.md.mobile}
          alignItems={{ mobile: 'flex-start', tablet: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="bodyXsRegular" component="p">
            {t`Health determines a position liquidation. It is not directly correlated to the price of the collateral. `}
            <Typography
              variant="bodyXsRegular"
              component="span"
              color="danger"
              sx={{ fontWeight: (t) => t.typography.fontWeightBold }}
            >
              {t`Liquidation may occur when health reaches 0.`}
            </Typography>
          </Typography>
          {!showPageHeader && <LlamaMonitorBotLinkButton />}
        </Stack>
      </Stack>
    </Stack>
  )
}
