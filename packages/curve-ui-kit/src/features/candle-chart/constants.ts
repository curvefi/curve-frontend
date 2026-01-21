import { t } from '@ui-kit/lib/i18n'

export const TIME_OPTIONS = ['15m', '30m', '1h', '4h', '6h', '12h', '1d', '7d', '14d'] as const
export const DEFAULT_TIME_OPTION = '1d' satisfies (typeof TIME_OPTIONS)[number]
export const DEFAULT_CHART_HEIGHT = 420

export const SOFT_LIQUIDATION_DESCRIPTION = t`Above the liquidation threshold, health mostly follows price (and slowly declines from interest). In the liquidation zone, health drops on any price movement as collateral is worn down inside the bands.`
