import { ReactNode } from 'react'
import { IconStyles, TooltipButton } from '@ui/Tooltip/TooltipButton'
import type { TooltipProps } from '@ui/Tooltip/types'

/**
 * Similar to `TooltipButton`, but renders an icon and uses the children for the tooltip text.
 */
export const TooltipIcon = ({
  children,
  customIcon,
  ...props
}: TooltipProps & {
  children: ReactNode
  iconStyles?: IconStyles
  customIcon?: ReactNode
}) => <TooltipButton {...props} showIcon customIcon={customIcon} tooltip={children}></TooltipButton>
