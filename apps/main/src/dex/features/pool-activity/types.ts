import type { Chain } from '@curvefi/prices-api'
import type { AllPoolTrade, PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import type { Token } from '@primitives/address.utils'

export type PoolSwapRow = AllPoolTrade & { chainId: number; blockchainId: Chain }
export type PoolLiquidityRow = PoolLiquidityEvent & { chainId: number; blockchainId: Chain; poolTokens: Token[] }
