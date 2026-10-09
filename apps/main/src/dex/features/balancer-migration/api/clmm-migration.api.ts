import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fetchJson } from '@primitives/fetch.utils'
import type { ClmmMigrationResponse } from '@primitives/router.utils'

export type ClmmMigrationParams = {
  chainId: number
  userAddress: Address
  positionManager: Address
  tokenId: string
  liquidity: string
  tokens: [Address, Address]
  tokenOut: Address
  /** Percent. */
  slippage: Decimal
  /** Redeemed tokens with a zero amount, e.g. one side of an out-of-range position. */
  skipTokens: Address[]
}

/** Enso bundle built by router-api, which holds the Enso key and adds the flat router fee. */
export const fetchClmmMigration = ({
  chainId,
  userAddress,
  positionManager,
  tokenId,
  liquidity,
  tokens,
  tokenOut,
  slippage,
  skipTokens,
}: ClmmMigrationParams) => {
  const query = new URLSearchParams({
    protocol: 'uniswap-v3',
    chainId: `${chainId}`,
    userAddress,
    positionManager,
    tokenId,
    liquidity,
    tokenOut,
    slippage,
  })
  tokens.forEach(token => query.append('tokens', token))
  skipTokens.forEach(token => query.append('skipTokens', token))
  return fetchJson<ClmmMigrationResponse>(`/api/router/v1/clmm-migration?${query}`)
}
