import type { TooltipProps } from '@/ui/Tooltip/types'

import React from 'react'

export type Content = {
  titleKey: TitleKey
  value: React.ReactNode
  tooltip?: React.ReactNode | string
  tooltipProps?: TooltipProps
  className?: string
  show?: boolean
}
