import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'

export const AlertClosePosition = () => (
  <Alert severity="info" variant="outlined">
    <AlertTitle>{t`Close position`}</AlertTitle>

    <Typography variant="bodySRegular" color="textSecondary">
      {t`Use collateral to repay all debt and retrieve remaining value. `}
    </Typography>
  </Alert>
)
