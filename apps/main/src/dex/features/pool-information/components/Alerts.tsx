import type { ReactNode } from 'react'
import Alert, { type AlertColor } from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AlertMessage = { severity: AlertColor; message: ReactNode }

export const Alerts = ({
  poolAlert,
  tokenAlert,
}: {
  poolAlert: AlertMessage | false
  tokenAlert: AlertMessage | false
}) => (
  <Stack sx={{ gap: Spacing.sm, paddingBlockStart: Spacing.md, ':empty': { display: 'none' } }}>
    {poolAlert && (
      <Alert variant="filled" severity={poolAlert.severity}>
        {poolAlert.message}
      </Alert>
    )}

    {tokenAlert && (
      <Alert variant="filled" severity={tokenAlert.severity}>
        {tokenAlert.message}
      </Alert>
    )}
  </Stack>
)
