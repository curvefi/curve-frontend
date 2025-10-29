import type { PoolAlert } from '@/dex/types/main.types'
import { AlertColor, AlertIcons } from '@/dex/utils/alerts'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

export const PoolAlertIcon = ({ alert: { alertType, message } }: { alert: PoolAlert }) => (
  <Tooltip title={message}>
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
    {(poolAlert?.isInformationOnly || poolAlert?.isInformationOnlyAndShowInForm) && <PoolAlertIcon alert={poolAlert} />}
    {tokenAlert && <PoolAlertIcon alert={tokenAlert} />}
  </>
)
