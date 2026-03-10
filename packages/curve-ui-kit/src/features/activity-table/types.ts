import type { Chain } from '@curvefi/prices-api'
import type { LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { AllPoolTrade, PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import type { Token } from '@primitives/address.utils'

// LLAMMA Types (for lending/crvusd markets)
export type LlammaTradeRow = LlammaTrade & { txUrl?: string; url?: never; network: Chain }
export type LlammaEventRow = LlammaEvent & {
  txUrl?: string
  url?: never
  network: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

// Pool Types (for DEX pools)
export type PoolTradeRow = AllPoolTrade & { txUrl?: string; url?: never; network: Chain }
export type PoolLiquidityRow = PoolLiquidityEvent & {
  txUrl?: string
  url?: never
  network: Chain
  poolTokens: Token[]
}
