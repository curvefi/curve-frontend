import type { ReactNode } from 'react'
import type { AlertType, PoolAlert } from '@/dex/types/main.types'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@ui-kit/shared/icons/InfoCircledIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

const AlertIcons: Record<AlertType, ReactNode> = {
  info: <InfoCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  error: <ExclamationTriangleIcon />,
  '': <InfoCircledIcon />,
  danger: <ExclamationTriangleIcon />,
}

const AlertText: Record<AlertType, ReactNode> = {
  '': t`Info`,
  info: t`Info`,
  warning: t`Warning`,
  error: t`Error`,
  danger: t`Danger`,
}

const AlertColor: Record<AlertType, TypographyProps['color']> = {
  '': 'info',
  info: 'info',
  warning: 'warning',
  error: 'error',
  danger: 'error',
}

export const PoolAlertBadge = ({ alert: poolAlert }: { alert: PoolAlert }) =>
  !poolAlert.isPoolPageOnly &&
  !poolAlert.isInformationOnly &&
  !poolAlert.isInformationOnlyAndShowInForm && (
    <Tooltip title={poolAlert.message}>
      <Typography
        color={AlertColor[poolAlert.alertType]}
        variant="bodyXsRegular"
        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
      >
        {AlertText[poolAlert.alertType]}
        {AlertIcons[poolAlert.alertType]}
      </Typography>
    </Tooltip>
  )
