import { ReactNode } from 'react'
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined'
import type { AlertType } from '@ui/AlertBox/types'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import type { TooltipProps } from '@ui/Tooltip/types'

export const TooltipAlert = ({
  alertType,
  isDeprecated,
  ...props
}: TooltipProps & {
  children: ReactNode
  alertType: AlertType
  isDeprecated?: boolean
}) => (
  <IconTooltip
    {...props}
    customIcon={
      <WarningOutlinedIcon
        color={isDeprecated ? 'error' : alertType === '' ? 'info' : alertType === 'danger' ? 'error' : alertType}
      />
    }
  />
)
