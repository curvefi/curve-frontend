import type { TooltipProps } from '@ui/Tooltip/types'
import { TitleKey } from '@/lend/types/lend.types'
import { ReactNode } from 'react'

export type Content = {
  titleKey: TitleKey
  value: ReactNode
  tooltip?: ReactNode
  tooltipProps?: TooltipProps
  className?: string
  show?: boolean
}
