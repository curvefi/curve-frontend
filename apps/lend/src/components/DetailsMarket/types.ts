import type { TooltipProps } from '@/ui/Tooltip/types'

import React from 'react'

export type Detail = {
  titleKey: TitleKey
  tooltip?: string | React.ReactNode
  tooltipProps?: TooltipProps
  value: React.ReactNode
  className?: string
  show?: boolean
}
