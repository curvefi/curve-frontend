import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Typography from '@mui/material/Typography'
import { t } from '@ui/lib/i18n'

export const UserPositionLiquidationNote = () => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  return (
    <Typography variant="bodyXsRegular">
      {isNewLlamalendHealth
        ? t`LlamaLend liquidations depend on your liquidation buffer, not on price alone.`
        : t`Llamalend liquidations are not price based, but health based.`}{' '}
      <Typography component="span" variant="bodyXsBold" sx={{ color: t => t.design.Text.TextColors.Highlight }}>
        {isNewLlamalendHealth
          ? t`Your position can be fully liquidated when your liquidation buffer is below 0% and the price is inside or below the range.`
          : t`Liquidations occur when health reaches 0.`}
      </Typography>
    </Typography>
  )
}
