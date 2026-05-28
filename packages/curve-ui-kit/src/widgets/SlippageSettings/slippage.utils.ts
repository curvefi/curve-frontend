import type { Decimal } from '@primitives/decimal.utils'

export const SLIPPAGE_TYPES = ['stable', 'crypto', 'leverage'] as const
export type SlippageType = (typeof SLIPPAGE_TYPES)[number]
export type SlippageKey = SlippageType | string
export type SlippageSettings = Record<SlippageKey, Decimal>

export const SLIPPAGE_PRESETS: SlippageSettings = { stable: '0.1', crypto: '0.5', leverage: '1' }

export const HIGH_SLIPPAGE_PRESETS: SlippageSettings = { stable: '0.5', crypto: '1', leverage: '5' }

export const MIN_SLIPPAGE: Decimal = `0.01`
export const MAX_RECOMMENDED_SLIPPAGE: Decimal = `5`
