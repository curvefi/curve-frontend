import type { Decimal } from '@primitives/decimal.utils'

export const SLIPPAGE_PRESETS = {
  STABLE: '0.1' as Decimal,
  CRYPTO: '0.5' as Decimal,
}

export const MIN_SLIPPAGE = `0.01` as const
export const MAX_RECOMMENDED_SLIPPAGE = `5` as const
