import type { TooltipProps } from 'ui/src/Tooltip/types'

import React from 'react'

import TooltipButton, { IconStyles } from 'ui/src/Tooltip/TooltipButton'

const TooltipIcon = ({
  children,
  customIcon,
  ...props
}: React.PropsWithChildren<
  TooltipProps & {
    iconStyles?: IconStyles
    customIcon?: React.ReactNode
  }
>) => {
  return <TooltipButton {...props} showIcon customIcon={customIcon} tooltip={children}></TooltipButton>
}

export default TooltipIcon
