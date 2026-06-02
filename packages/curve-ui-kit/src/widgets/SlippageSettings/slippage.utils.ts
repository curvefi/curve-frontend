import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'

export const SLIPPAGE_TYPES = ['stable', 'crypto', 'leverage'] as const
export type SlippageType = (typeof SLIPPAGE_TYPES)[number]
export type SlippageSettings = Record<SlippageType, Decimal>

export const [MIN_SLIPPAGE, MAX_SLIPPAGE] = [0.001, 50]

const slippage = (
  slippage: Decimal,
  title: string,
  helper: string,
): {
  default: Decimal
  presets: [Decimal, Decimal]
  min: Decimal
  max: Decimal
  title: string
  helper: string
} => ({
  default: slippage,
  presets: [slippage, `${+slippage * 2}`],
  min: `${+slippage / 2}`,
  max: `${+slippage * 4}`,
  title,
  helper,
})

export const SLIPPAGE: Record<
  SlippageType,
  {
    default: Decimal
    presets: [Decimal, Decimal]
    min: Decimal
    max: Decimal
    title: string
    helper: string
  }
> = {
  stable: slippage('0.03', t`Stableswap slippage`, t`Used when the route only goes through stableswap pools`),
  crypto: slippage('0.1', t`Cryptoswap slippage`, t`Used when the route goes through at least one cryptoswap pool`),
  leverage: slippage('0.5', t`Leverage slippage`, t`Used when leveraging on llamalend`),
}
