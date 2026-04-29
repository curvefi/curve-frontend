import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'

export const AlertRepayDebtToIncreaseHealth = () => (
  <Alert severity="warning" variant="outlined">
    <AlertTitle>{t`Improve health`}</AlertTitle>

    <Typography variant="bodySRegular" color="textSecondary">
      {t`Repay debt to increase health and keep your position open. This won’t end soft liquidation while the price is in range.`}
    </Typography>
  </Alert>
)
