import { ReactNode } from 'react'
import { TitleKey } from '@/lend/types/lend.types'
import type { TooltipProps } from '@ui/Tooltip/types'

export type Content = {
  titleKey: TitleKey
  value: ReactNode
  tooltip?: ReactNode
  tooltipProps?: TooltipProps
  className?: string
  show?: boolean
}
