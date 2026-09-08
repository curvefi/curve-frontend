import { ReactNode } from 'react'
import type { AlertType } from '@legacy-ui/AlertBox/types'
import { TooltipIcon as IconTooltip } from '@legacy-ui/Tooltip/TooltipIcon'
import type { TooltipProps } from '@legacy-ui/Tooltip/types'
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined'

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
