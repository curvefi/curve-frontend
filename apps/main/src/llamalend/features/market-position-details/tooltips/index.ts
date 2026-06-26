import { createElement } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { HealthTooltipContent } from './HealthTooltipContent'

export * from './AmountSuppliedTooltipContent'
export * from './HealthTooltipContent'
export * from './LiquidationThresholdMetricTooltipContent'
export * from './VaultSharesTooltipContent'

export const LEGACY_HEALTH_TOOLTIP = {
  title: t`Health`,
  body: createElement(HealthTooltipContent),
} as const

export const HEALTH_TOOLTIP = {
  title: t`Health`,
  shortTitle: t`Health`,
  body: createElement(HealthTooltipContent),
} as const

export const LIQUIDATION_BUFFER_TOOLTIP = {
  title: t`Liquidation buffer`,
  shortTitle: t`Liq. buffer`,
  body: createElement(HealthTooltipContent),
} as const
