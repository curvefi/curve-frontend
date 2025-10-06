import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'

export const LastUpdated = () => (
  <Stack justifyContent="space-evenly" alignItems="end">
    <Typography variant="bodyXsRegular" color="textTertiary">{t`Last Updated`}</Typography>
    <Typography variant="highlightM">12.08.2024</Typography>
  </Stack>
)
