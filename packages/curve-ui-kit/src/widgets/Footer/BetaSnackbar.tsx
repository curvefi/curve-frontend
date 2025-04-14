import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import { t } from '@ui-kit/lib/i18n'
import { Duration } from '@ui-kit/themes/design/0_primitives'

export const BetaSnackbar = ({
  isBeta,
  open,
  onClose,
  headerHeight,
}: {
  open: boolean
  onClose: () => void
  headerHeight: string
  isBeta: boolean
}) => (
  <Snackbar
    open={open}
    onClose={onClose}
    autoHideDuration={Duration.Snackbar}
    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
    sx={{ top: headerHeight, left: 'unset' }} // unset the left otherwise it will take the whole width
  >
    <Alert variant="outlined" severity="success">
      <AlertTitle>{isBeta ? t`Beta Features On` : t`Beta Features Off`}</AlertTitle>
      {isBeta ? t`You have successfully enabled beta features.` : t`You have successfully disabled beta features.`}
    </Alert>
  </Snackbar>
)
