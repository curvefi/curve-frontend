import { ReactNode } from 'react'
import type { AlertType } from 'ui/src/AlertBox/types'
import IconTooltip from 'ui/src/Tooltip/TooltipIcon'
import type { TooltipProps } from 'ui/src/Tooltip/types'
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined'

const TooltipAlert = ({
  alertType,
  isDeprecated,
  ...props
}: TooltipProps & {
  children: ReactNode
  alertType: AlertType
  isDeprecated?: boolean
}) => {
  const color = isDeprecated ? 'error' : alertType === '' ? 'info' : alertType === 'danger' ? 'error' : alertType

  return <IconTooltip {...props} customIcon={<WarningOutlinedIcon color={color} />} />
}

export default TooltipAlert
