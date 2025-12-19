import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const LAST_UPDATED_DATE = new Date(2025, 11, 17) // Month is 0-indexed

export const LastUpdated = () => (
  <Stack justifyContent="space-evenly" alignItems="end">
    <Typography variant="bodyXsRegular" color="textTertiary">{t`Last Updated`}</Typography>
    <Typography variant="highlightM">{formatDate(LAST_UPDATED_DATE)}</Typography>
  </Stack>
)
