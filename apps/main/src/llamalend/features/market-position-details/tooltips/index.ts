import { createElement } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { LegacyHealthTooltipContent } from './LegacyHealthTooltipContent'

export * from './AmountSuppliedTooltipContent'
export * from './LegacyHealthTooltipContent'
export * from './LiquidationThresholdMetricTooltipContent'
export * from './VaultSharesTooltipContent'

export const LEGACY_HEALTH_TOOLTIP = {
  title: t`Health`,
  body: createElement(LegacyHealthTooltipContent),
} as const

export const HEALTH_TOOLTIP = {
  title: t`Health`,
  shortTitle: t`Health`,
  body: createElement(LegacyHealthTooltipContent),
} as const

export const LIQUIDATION_BUFFER_TOOLTIP = {
  title: t`Liquidation buffer`,
  shortTitle: t`Liq. buffer`,
  body: createElement(LegacyHealthTooltipContent),
} as const
