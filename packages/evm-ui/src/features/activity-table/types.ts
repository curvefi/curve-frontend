import type { Chain } from '@curvefi/prices-api'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import type { LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { AllPoolTrade, PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import type { Timestamp } from '@curvefi/prices-api/timestamp'
import type { Token } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { TokenPairAddresses } from '@ui/components/TokenIcon'

/** A token of an activity row, whose address can be a token pair so its icon shows both tokens */
export type ActivityToken = Omit<Token, 'address'> & { address: Token['address'] | TokenPairAddresses }

/** A single token delta of an activity event, used to render one row per token */
export type ActivityTokenDelta = {
  label: string
  token: ActivityToken | undefined
  blockchainId: Chain
  amount: number // positive when tokens go in, negative when they go out
  amountUsd: number | Nullish
  timestamp: Timestamp
}

// LLAMMA Types (for lending/crvusd markets)
export type MarketTradeRow = Omit<LlammaTrade, 'tokenBought' | 'tokenSold'> & {
  chainId: number
  blockchainId: Chain
  tokenBought: ActivityToken
  tokenSold: ActivityToken
}
export type MarketEventRow = LlammaEvent & {
  chainId: number
  blockchainId: Chain
  collateralToken: ActivityToken | undefined
  borrowToken: ActivityToken | undefined
}

export type VaultActivityProps = {
  chainId: number
  blockchainId: Chain
  borrowToken: Token | undefined
  vaultToken: Token | undefined
}

export type VaultActivityRow = VaultEvent &
  Omit<VaultActivityProps, 'borrowToken' | 'vaultToken'> & {
    borrowToken: ActivityToken | undefined
    vaultToken: ActivityToken | undefined
  }

// Pool Types (for DEX pools)
export type PoolTradeRow = AllPoolTrade & { chainId: number; blockchainId: Chain }
export type PoolLiquidityRow = PoolLiquidityEvent & { chainId: number; blockchainId: Chain; poolTokens: Token[] }
