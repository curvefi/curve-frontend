import type { CSSProperties, JSX, ReactNode } from 'react'
import type { TooltipProps } from '@ui/Tooltip/types'

type ValueOf<T> = T[keyof T]

export type ChipSize = 'xs' | 'sm' | 'md' | 'lg'

export type ChipProps = {
  className?: string
  as?: keyof JSX.IntrinsicElements
  isBlock?: boolean
  isBold?: boolean
  isDarkBg?: boolean
  isError?: boolean
  isNotBold?: boolean
  isNumber?: boolean
  isMono?: boolean
  fontVariantNumeric?: ValueOf<Pick<CSSProperties, 'fontVariantNumeric'>>
  maxWidth?: string
  noWrap?: boolean
  opacity?: number
  size?: ChipSize
  tooltip?: ReactNode
  tooltipProps?: TooltipProps
}
