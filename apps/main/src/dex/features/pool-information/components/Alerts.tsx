import type { PoolAlert } from '@/dex/types/main.types'
import { alertTypeToSeverity } from '@/dex/utils/alert.utils'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const Alerts = ({ poolAlert, tokenAlert }: { poolAlert: PoolAlert | null; tokenAlert: PoolAlert | null }) => (
  <Stack sx={{ gap: Spacing.sm, paddingBlockStart: Spacing.md, ':empty': { display: 'none' } }}>
    {poolAlert && !poolAlert.isDisableDeposit && !poolAlert.isInformationOnlyAndShowInForm && (
      <Alert variant="filled" severity={alertTypeToSeverity[poolAlert.alertType]}>
        {poolAlert.message ?? poolAlert.banner?.subtitle}
      </Alert>
    )}

    {tokenAlert && tokenAlert.isInformationOnly && (
      <Alert variant="filled" severity={alertTypeToSeverity[tokenAlert.alertType]}>
        {tokenAlert.message ?? poolAlert?.banner?.subtitle}
      </Alert>
    )}
  </Stack>
)
