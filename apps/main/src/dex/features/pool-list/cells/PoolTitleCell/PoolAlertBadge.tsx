import type { PoolAlert } from '@/dex/types/main.types'
import { AlertColor, AlertIcons, AlertText } from '@/dex/utils/alerts'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

export const PoolAlertBadge = ({
  alert: { alertType, isInformationOnly, isInformationOnlyAndShowInForm, isPoolPageOnly, message },
}: {
  alert: PoolAlert
}) =>
  !isPoolPageOnly &&
  !isInformationOnly &&
  !isInformationOnlyAndShowInForm && (
    <Tooltip title={message}>
      <Typography
        color={AlertColor[alertType]}
        variant="bodyXsRegular"
        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
      >
        {AlertText[alertType]}
        {AlertIcons[alertType]}
      </Typography>
    </Tooltip>
  )
