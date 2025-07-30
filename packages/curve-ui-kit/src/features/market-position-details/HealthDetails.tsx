import { Stack, Typography, type Theme, useTheme } from '@mui/material'
import type { Health } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { HealthBar } from '@ui-kit/features/market-position-details/HealthBar'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const getHealthValueColor = (value: number, theme: Theme) => {
  if (value < 5) return 'error'
  if (value < 15) return 'warning'
  if (value < 50) return theme.design.Color.Secondary[500]
  if (value >= 100) return theme.design.Color.Secondary[600]
  return 'textPrimary'
}

export const HealthDetails = ({ health }: { health: Health }) => {
  const theme = useTheme()
  return (
    <Stack sx={{ padding: Spacing.md }}>
      <Stack gap={2}>
        <Stack display="grid" gridTemplateColumns="auto 1fr" alignItems="end" gap={5}>
          <Metric
            label={t`Health`}
            value={Number(health?.value)}
            loading={health?.loading}
            valueOptions={{ unit: 'percentage', decimals: 2, color: getHealthValueColor(health?.value ?? 0, theme) }}
            size="large"
          />
          <HealthBar health={Number(health?.value)} />
        </Stack>
        <Stack display="flex" flexDirection="column">
          <Typography variant="bodyXsRegular">
            {t`Health determines a position liquidation. It is not directly correlated to the price of the collateral. `}
          </Typography>
          <Typography variant="bodyXsRegular" sx={{ fontWeight: (t) => t.typography.fontWeightBold }}>
            {t`Liquidation may occur when health reaches 0.`}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
