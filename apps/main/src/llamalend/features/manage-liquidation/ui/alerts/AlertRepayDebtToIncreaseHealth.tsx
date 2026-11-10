import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui/lib/i18n'

export const AlertRepayDebtToIncreaseHealth = () => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  return (
    <Alert severity="warning" variant="outlined">
      <AlertTitle>{isNewLlamalendHealth ? t`Raise liquidation buffer` : t`Improve health`}</AlertTitle>

      <Typography variant="bodySRegular" color="textSecondary">
        {isNewLlamalendHealth
          ? t`Repay debt to raise your liquidation buffer and keep your position open. This won’t end soft liquidation while the price is in range.`
          : t`Repay debt to increase health and keep your position open. This won’t end soft liquidation while the price is in range.`}
      </Typography>
    </Alert>
  )
}
