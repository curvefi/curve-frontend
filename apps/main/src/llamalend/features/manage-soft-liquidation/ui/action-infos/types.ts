import type { Decimal } from '@primitives/decimal.utils'

/** Simple combination of a token symbol with a certain amount */
export type TokenAmount = { symbol: string; amount: Decimal }
