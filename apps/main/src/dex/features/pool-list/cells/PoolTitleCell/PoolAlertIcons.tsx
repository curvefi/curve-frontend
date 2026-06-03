import type { PoolAlert } from '@/dex/types/main.types'
import { AlertColor, AlertIcons } from '@/dex/utils/alerts'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

const PoolAlertIcon = ({ alert: { alertType, message } }: { alert: PoolAlert }) => (
  // made all tooltips clickable, even if most are not clickable, it's hard to know here when there is a link in the alert.
  <Tooltip title={message} clickable>
    <Typography color={AlertColor[alertType]} variant="bodyXsRegular">
      {AlertIcons[alertType]}
    </Typography>
  </Tooltip>
)

export const PoolAlertIcons = ({
  tokenAlert,
  poolAlert,
}: {
  poolAlert: PoolAlert | null
  tokenAlert: PoolAlert | null
}) => (
  <>
    {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule. */}
    {(poolAlert?.isInformationOnly || poolAlert?.isInformationOnlyAndShowInForm) && <PoolAlertIcon alert={poolAlert} />}
    {tokenAlert && <PoolAlertIcon alert={tokenAlert} />}
  </>
)
