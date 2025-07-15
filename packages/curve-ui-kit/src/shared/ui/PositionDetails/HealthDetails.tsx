import { Box, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type { Health } from '@ui-kit/shared/ui/PositionDetails/BorrowPositionDetails'
import { HealthBar } from '@ui-kit/shared/ui/PositionDetails/HealthBar'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const getHealthValueColor = (value: number) => {
  if (value < 5) return 'error'
  if (value < 15) return 'warning'
  return 'textPrimary'
}

export const HealthDetails = ({ health }: { health: Health }) => (
  <Box
    display="flex"
    flexDirection="column"
    sx={{
      padding: Spacing.md,
    }}
  >
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      sx={{
        padding: Spacing.md,
        border: 2,
        borderColor: (t) => t.design.Layer.Highlight.Fill,
      }}
    >
      <Box display="grid" gridTemplateColumns="auto 1fr" alignItems="end" gap={5}>
        <Metric
          label={t`Health`}
          value={Number(health?.value)}
          loading={health?.loading}
          valueOptions={{ unit: 'percentage', decimals: 2, color: getHealthValueColor(health?.value ?? 0) }}
          size="large"
        />
        <HealthBar health={Number(health?.value)} />
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="bodyXsRegular">
          {t`Health determines a position liquidation. It is not directly correlated to the price of the collateral. `}
        </Typography>
        <Typography variant="bodyXsRegular" sx={{ fontWeight: (t) => t.typography.fontWeightBold }}>
          {t`Liquidations occur when health reaches 0.`}
        </Typography>
      </Box>
    </Box>
  </Box>
)
