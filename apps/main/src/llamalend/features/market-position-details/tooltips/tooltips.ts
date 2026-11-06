import { createElement } from 'react'
import { t } from '@ui/lib/i18n'
import { LegacyHealthTooltipContent } from './LegacyHealthTooltipContent'
import { LiquidationBufferTooltipContent } from './LiquidationBufferTooltipContent'

export const LEGACY_HEALTH_TOOLTIP = { title: t`Health`, body: createElement(LegacyHealthTooltipContent) } as const

export const LIQUIDATION_BUFFER_TOOLTIP = {
  title: t`Liquidation buffer`,
  body: createElement(LiquidationBufferTooltipContent),
} as const
