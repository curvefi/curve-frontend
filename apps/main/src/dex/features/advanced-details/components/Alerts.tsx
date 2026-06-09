import type { AlertType, PoolAlert } from '@/dex/types/main.types'
import Alert, { type AlertProps } from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const alertTypeToSeverity: Record<AlertType, AlertProps['severity']> = {
  danger: 'error',
  error: 'error',
  warning: 'warning',
  info: 'info',
  '': 'info',
}

export const Alerts = ({ poolAlert, tokenAlert }: { poolAlert: PoolAlert | null; tokenAlert: PoolAlert | null }) => (
  <Stack sx={{ gap: Spacing.sm, paddingBlockStart: Spacing.md }}>
    {poolAlert && !poolAlert.isDisableDeposit && !poolAlert.isInformationOnlyAndShowInForm && (
      <Alert variant="filled" severity={alertTypeToSeverity[poolAlert.alertType]}>
        {poolAlert.message}
      </Alert>
    )}

    {tokenAlert && tokenAlert.isInformationOnly && (
      <Alert variant="filled" severity={alertTypeToSeverity[tokenAlert.alertType]}>
        {tokenAlert.message}
      </Alert>
    )}
  </Stack>
)
