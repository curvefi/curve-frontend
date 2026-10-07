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
}

/** Enso bundle built by router-api, which holds the Enso key and adds the flat router fee. */
export const fetchClmmMigration = ({ tokens, ...params }: ClmmMigrationParams) => {
  const query = new URLSearchParams({ protocol: 'uniswap-v3', ...params, chainId: `${params.chainId}` })
  tokens.forEach(token => query.append('tokens', token))
  return fetchJson<ClmmMigrationResponse>(`/api/router/v1/clmm-migration?${query}`)
}
