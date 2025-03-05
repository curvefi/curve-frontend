import type { TooltipProps } from 'ui/src/Tooltip/types'
import TooltipButton, { IconStyles } from 'ui/src/Tooltip/TooltipButton'
import { ReactNode } from 'react'

const TooltipIcon = ({
  children,
  customIcon,
  ...props
}: TooltipProps & {
  children: ReactNode
  iconStyles?: IconStyles
  customIcon?: ReactNode
}) => <TooltipButton {...props} showIcon customIcon={customIcon} tooltip={children}></TooltipButton>

export default TooltipIcon
