import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Button, Stack, Typography, useTheme } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
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
          <Button
            variant="link"
            color="ghost"
            href="https://t.me/LlamalendMonitorBot?ref=news.curve.finance"
            target="_blank"
            rel="noreferrer"
            sx={{ flexShrink: 0 }}
            startIcon={<NotificationsIcon sx={(t) => ({ fontSize: t.typography.fontSize })} />}
            endIcon={<ArrowOutwardIcon sx={(t) => ({ fontSize: t.typography.fontSize })} />}
          >
            {t`Get alerts`}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
