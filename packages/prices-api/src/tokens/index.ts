import type { Address } from '@primitives/address.utils'
import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

/** Fetch a token's metadata, with the coins and pool of Curve LP tokens */
export async function getToken(blockchainId: Chain, tokenAddress: Address, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/tokens/${blockchainId}/${tokenAddress}`)

  return Schema.getTokenResponse.parse(response)
}
