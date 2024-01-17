import type { TooltipProps } from 'ui/src/Tooltip/types'

import React from 'react'

import Tooltip from 'ui/src/Tooltip/Tooltip'

interface Props extends TooltipProps {
  customIcon?: React.ReactNode
}

const IconTooltip = ({ children, customIcon, ...props }: React.PropsWithChildren<Props>) => {
  return <Tooltip {...props} showIcon customIcon={customIcon} tooltip={children}></Tooltip>
}

export default IconTooltip
