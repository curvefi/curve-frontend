import { ReactNode } from 'react'
import TooltipButton, { IconStyles } from 'ui/src/Tooltip/TooltipButton'
import type { TooltipProps } from 'ui/src/Tooltip/types'

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
