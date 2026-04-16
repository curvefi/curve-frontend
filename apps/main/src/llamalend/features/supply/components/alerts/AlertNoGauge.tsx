import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'

export const AlertNoGauge = () => (
  <Alert severity="info" variant="outlined" data-testId="alert-no-gauge">
    <AlertTitle>{t`Staking unavailable`}</AlertTitle>
    <Typography variant="bodySRegular" color="textSecondary">
      {t`This market does not have a gauge.`}
    </Typography>
  </Alert>
)
