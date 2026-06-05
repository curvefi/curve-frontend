import type { PoolAlert } from '@/dex/types/main.types'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AlertsProps = {
  poolAlert: PoolAlert | null
  tokenAlert: PoolAlert | null
}

const PoolMessageAlert = ({ alert: { alertType, message } }: { alert: PoolAlert }) => (
  <Alert
    variant="filled"
    severity={alertType === 'danger' || alertType === 'error' ? 'error' : alertType === 'warning' ? 'warning' : 'info'}
  >
    {message}
  </Alert>
)

export const Alerts = ({ poolAlert, tokenAlert }: AlertsProps) => (
  <Stack sx={{ gap: Spacing.sm, paddingBlockStart: Spacing.md }}>
    {poolAlert && !poolAlert.isDisableDeposit && !poolAlert.isInformationOnlyAndShowInForm && (
      <PoolMessageAlert alert={poolAlert} />
    )}

    {tokenAlert && tokenAlert.isInformationOnly && <PoolMessageAlert alert={tokenAlert} />}
  </Stack>
)
