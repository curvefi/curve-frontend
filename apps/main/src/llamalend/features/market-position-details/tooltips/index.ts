import { createElement } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { HealthTooltipContent } from './HealthTooltipContent'

export * from './AmountSuppliedTooltipContent'
export * from './HealthTooltipContent'
export * from './LiquidationThresholdMetricTooltipContent'
export * from './VaultSharesTooltipContent'

export const HEALTH_TOOLTIP = {
  title: t`Health`,
  body: createElement(HealthTooltipContent),
} as const
