import type { ReactElement, ReactNode } from 'react'
import type { AlertType } from '@/dex/types/main.types'
import { t } from '@evm-ui/lib/i18n'
import { ExclamationTriangleIcon } from '@evm-ui/shared/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@evm-ui/shared/icons/InfoCircledIcon'
import { TypographyProps } from '@mui/material/Typography'

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
