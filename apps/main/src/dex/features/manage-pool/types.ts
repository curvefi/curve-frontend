import type { Address } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'

export type Tokens = Record<'tokenA' | 'tokenB', { address: Address; symbol: string; decimals: number }>

export type RefuelFormValues = {
  tokenAAmount: Decimal | undefined
  tokenBAmount: Decimal | undefined
}
