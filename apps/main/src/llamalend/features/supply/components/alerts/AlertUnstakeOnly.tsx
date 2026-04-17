import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t, Trans } from '@ui-kit/lib/i18n'

export const AlertUnstakeOnly = () => (
  <Alert severity="info" variant="outlined" data-testid="alert-unstake-only">
    <AlertTitle>{t`Unstake only`}</AlertTitle>
    <Typography variant="bodySRegular" color="textSecondary">
      <Trans>
        You are choosing to <strong>unstake</strong>, to recover your lent assets you will need to{' '}
        <strong>withdraw</strong> subsequently.
      </Trans>
    </Typography>
  </Alert>
)
