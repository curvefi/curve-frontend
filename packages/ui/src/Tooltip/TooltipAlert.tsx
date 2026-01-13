import { ReactNode } from 'react'
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined'
import type { AlertType } from 'ui/src/AlertBox/types'
import { TooltipIcon as IconTooltip } from 'ui/src/Tooltip/TooltipIcon'
import type { TooltipProps } from 'ui/src/Tooltip/types'

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
