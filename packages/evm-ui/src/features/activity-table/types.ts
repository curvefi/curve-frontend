import type { Chain } from '@curvefi/prices-api'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import type { LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { AllPoolTrade, PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import type { Timestamp } from '@curvefi/prices-api/timestamp'
import type { Token } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'

/** A single token delta of an activity event, used to render one row per token */
export type ActivityTokenDelta = {
  label: string
  token: Token | undefined
  blockchainId: Chain
  amount: number // positive when tokens go in, negative when they go out
  amountUsd: number | Nullish
  timestamp: Timestamp
}

// LLAMMA Types (for lending/crvusd markets)
export type MarketTradeRow = LlammaTrade & { chainId: number; blockchainId: Chain }
export type MarketEventRow = LlammaEvent & {
  chainId: number
  blockchainId: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

export type VaultActivityProps = {
  chainId: number
  blockchainId: Chain
  borrowToken: Token | undefined
  vaultToken: Token | undefined
}

export type VaultActivityRow = VaultEvent & VaultActivityProps

// Pool Types (for DEX pools)
export type PoolTradeRow = AllPoolTrade & { chainId: number; blockchainId: Chain }
export type PoolLiquidityRow = PoolLiquidityEvent & { chainId: number; blockchainId: Chain; poolTokens: Token[] }
