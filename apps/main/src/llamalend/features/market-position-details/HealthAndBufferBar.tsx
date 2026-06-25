import { Stack, type SxProps, Typography } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type HealthAndBufferBarProps = {
  health: Decimal | null | undefined
  liquidationBuffer: Decimal | null | undefined
  softLiquidation: boolean | undefined | null
  sx?: SxProps
}

const formatHealthValue = (value: Decimal | null | undefined) =>
  value == null ? '-' : formatNumber(value, { abbreviate: false })

export const HealthAndBufferBar = ({ health, liquidationBuffer, softLiquidation, sx }: HealthAndBufferBarProps) => (
  <Stack sx={applySxProps({ gap: Spacing.xxs }, sx)}>
    <Typography variant="bodyXsRegular" color="textSecondary">
      {t`Health`}: {formatHealthValue(health)}
    </Typography>
    <Typography variant="bodyXsRegular" color="textSecondary">
      {t`Liquidation Buffer`}: {formatHealthValue(liquidationBuffer)}
    </Typography>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {t`Liquidation protection`}: {softLiquidation ? t`active` : t`inactive`}
    </Typography>
  </Stack>
)
