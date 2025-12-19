import type { TimeOption } from './types'

export const TIME_OPTIONS: TimeOption[] = ['15m', '30m', '1h', '4h', '6h', '12h', '1d', '7d', '14d'] as const
export const DEFAULT_TIME_OPTION: TimeOption = '1d'
