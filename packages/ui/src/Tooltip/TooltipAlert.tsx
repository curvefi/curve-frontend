import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined'

import type { AlertType } from 'ui/src/AlertBox/types'
import type { TooltipProps } from 'ui/src/Tooltip/types'

import * as React from 'react'
import IconTooltip from 'ui/src/Tooltip/TooltipIcon'

const TooltipAlert = ({
  alertType,
  isDeprecated,
  ...props
}: React.PropsWithChildren<
  TooltipProps & {
    alertType: AlertType
    isDeprecated?: boolean
  }
>) => {
  const color = isDeprecated ? 'error' : alertType === '' ? 'info' : alertType === 'danger' ? 'error' : alertType

  return <IconTooltip {...props} customIcon={<WarningOutlinedIcon color={color} />} />
}

export default TooltipAlert
