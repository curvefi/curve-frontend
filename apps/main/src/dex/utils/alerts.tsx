import type { ReactNode } from 'react'
import type { AlertType } from '@/dex/types/main.types'
import { TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@ui-kit/shared/icons/InfoCircledIcon'

export const AlertIcons: Record<AlertType, ReactNode> = {
  info: <InfoCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  error: <ExclamationTriangleIcon />,
  '': <InfoCircledIcon />,
  danger: <ExclamationTriangleIcon />,
}

export const AlertColor: Record<AlertType, TypographyProps['color']> = {
  '': 'info',
  info: 'info',
  warning: 'warning',
  error: 'error',
  danger: 'error',
}

export const AlertText: Record<AlertType, ReactNode> = {
  '': t`Info`,
  info: t`Info`,
  warning: t`Warning`,
  error: t`Error`,
  danger: t`Danger`,
}
