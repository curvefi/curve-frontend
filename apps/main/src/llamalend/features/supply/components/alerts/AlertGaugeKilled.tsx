import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui/lib/i18n'

export const AlertGaugeKilled = () => (
  <Alert severity="warning" variant="outlined" data-testid="alert-gauge-killed">
    <AlertTitle>{t`Inactive gauge`}</AlertTitle>
    <Typography variant="bodySRegular" color="textSecondary">
      {t`This gauge no longer receives CRV emissions.`}
    </Typography>
  </Alert>
)
