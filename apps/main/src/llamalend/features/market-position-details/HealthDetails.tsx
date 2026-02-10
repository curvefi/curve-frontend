import { Stack, Typography, useTheme } from '@mui/material'
import { useMarketPageHeader } from '@ui-kit/hooks/useFeatureFlags'
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
  const showPageHeader = useMarketPageHeader()
  return (
    <Stack sx={{ padding: Spacing.md }}>
      <Stack gap={2}>
        <Stack
          display="grid"
          gridTemplateColumns={{ mobile: '1fr', tablet: 'auto 1fr' }}
          alignItems="end"
          gap={{ mobile: 0, tablet: 5 }}
        >
          <Metric
            label={t`Health`}
            value={Number(value)}
            loading={loading}
            valueOptions={{ unit: 'none', color: getHealthValueColor({ health: decimal(value), theme }) }}
            size="large"
          />
          <HealthBar health={Number(value)} softLiquidation={softLiquidation} />
        </Stack>
        <Stack
          flexDirection={{ mobile: 'column', tablet: 'row' }}
          gap={1}
          alignItems={{ mobile: 'flex-start', tablet: 'center' }}
          justifyContent="space-between"
        >
          <Stack display="flex" flexDirection="column">
            <Typography variant="bodyXsRegular">
              {t`Health determines a position liquidation. It is not directly correlated to the price of the collateral. `}
            </Typography>
            <Typography variant="bodyXsRegular" sx={{ fontWeight: (t) => t.typography.fontWeightBold }}>
              {t`Liquidation may occur when health reaches 0.`}
            </Typography>
          </Stack>
          {!showPageHeader && <LlamaMonitorBotLinkButton />}
        </Stack>
      </Stack>
    </Stack>
  )
}
