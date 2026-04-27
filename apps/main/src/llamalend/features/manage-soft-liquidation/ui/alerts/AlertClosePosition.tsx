import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'

export const AlertClosePosition = ({ badDebt }: { badDebt: boolean }) => (
  <Alert severity={badDebt ? 'error' : 'info'} variant="outlined">
    <AlertTitle>{t`Close position`}</AlertTitle>

    <Typography variant="bodySRegular" color="textSecondary">
      {badDebt
        ? t`Your position has incurred bad debt to the market and there is no value to recover.`
        : t`Use collateral to repay all debt and retrieve remaining value. `}
    </Typography>
  </Alert>
)
