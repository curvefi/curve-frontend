import type { AlertType } from 'ui/src/AlertBox/types'
import type { TooltipProps } from 'ui/src/Tooltip/types'

import * as React from 'react'
import Icon from 'ui/src/Icon'
import IconTooltip from 'ui/src/IconTooltip'

interface Props extends TooltipProps {
  alertType: AlertType
}

const AlertTooltipIcon = ({ alertType, ...props }: React.PropsWithChildren<Props>) => {
  return (
    <IconTooltip {...props} customIcon={<Icon name="WarningSquareFilled" size={24} fill={getColor(alertType)} />} />
  )
}

function getColor(alertType: AlertType) {
  if (alertType === 'error' || alertType === 'danger') {
    return `var(--danger-400)`
  } else if (alertType === 'info') {
    return `var(--info-400)`
  } else if (alertType === 'warning') {
    return `var(--warning-400)`
  }
}

export default AlertTooltipIcon
