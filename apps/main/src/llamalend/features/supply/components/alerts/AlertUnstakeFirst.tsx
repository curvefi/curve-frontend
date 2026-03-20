import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t, Trans } from '@ui-kit/lib/i18n'

export const AlertUnstakeFirst = () => (
  <Alert severity="info" variant="outlined">
    <AlertTitle>{t`Unstake required`}</AlertTitle>
    <Typography variant="bodySRegular" color="textSecondary">
      <Trans>
        Please <strong>unstake</strong> your assets first.
      </Trans>
    </Typography>
  </Alert>
)
