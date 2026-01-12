import { t } from '@ui-kit/lib/i18n'
import type { TimeOption } from './types'

export const TIME_OPTIONS: TimeOption[] = ['15m', '30m', '1h', '4h', '6h', '12h', '1d', '7d', '14d'] as const
export const DEFAULT_TIME_OPTION: TimeOption = '1d'
export const DEFAULT_CHART_HEIGHT = 420

export const SOFT_LIQUIDATION_DESCRIPTION = t`When the price enters the liquidation zone, health will start decreasing putting your position at risk. Repay debt to improve health or close your position to avoid liquidation.`
