import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const UserPositionLiquidationNote = () => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  return (
    <Stack direction="row" sx={{ gap: Spacing.xs }}>
      <Typography variant="bodyXsRegular">
        {isNewLlamalendHealth
          ? t`LlamaLend liquidations depend on your liquidation buffer, not on price alone.`
          : t`Llamalend liquidations are not price based, but health based.`}
      </Typography>
      <Typography variant="bodyXsBold" sx={{ color: t => t.design.Text.TextColors.Highlight }}>
        {isNewLlamalendHealth
          ? t`Your position can be fully liquidated when your liquidation buffer is below 0% and the price is inside or below the range.`
          : t`Liquidations occur when health reaches 0.`}
      </Typography>
    </Stack>
  )
}
