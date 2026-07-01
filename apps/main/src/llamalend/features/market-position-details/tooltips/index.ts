import { createElement } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { HealthTooltipContent } from './HealthTooltipContent'
import { LegacyHealthTooltipContent } from './LegacyHealthTooltipContent'
import { LiquidationBufferTooltipContent } from './LiquidationBufferTooltipContent'

export * from './AmountSuppliedTooltipContent'
export * from './HealthTooltipContent'
export * from './LegacyHealthTooltipContent'
export * from './LiquidationBufferTooltipContent'
export * from './LiquidationThresholdMetricTooltipContent'
export * from './VaultSharesTooltipContent'

export const LEGACY_HEALTH_TOOLTIP = {
  title: t`Health`,
  body: createElement(LegacyHealthTooltipContent),
} as const

export const HEALTH_TOOLTIP = {
  title: t`Health`,
  shortTitle: t`Health`,
  body: createElement(HealthTooltipContent),
} as const

export const LIQUIDATION_BUFFER_TOOLTIP = {
  title: t`Liquidation buffer`,
  shortTitle: t`Liq. buffer`,
  body: createElement(LiquidationBufferTooltipContent),
} as const
