import type { ReactElement, ReactNode } from 'react'
import type { AlertType } from '@/dex/types/main.types'
import { TypographyProps } from '@mui/material/Typography'
import { ExclamationTriangleIcon } from '@ui/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@ui/icons/InfoCircledIcon'
import { t } from '@ui/lib/i18n'

export const AlertIcons: Record<AlertType, ReactElement> = {
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
