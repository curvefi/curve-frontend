import type { Address } from '@primitives/address.utils'
import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options, type Chain } from '..'
import * as Parsers from './parsers'
import type * as Responses from './responses'

/**
 * Fetch USD price for a token.
 */
export async function getUsdPrice(blockchainId: Chain, contractAddress: Address, options?: Options) {
  const host = getHost(options)
  const url = `${host}/v1/usd_price/${blockchainId}/${contractAddress}`

  const resp = await fetch<Responses.GetUsdPriceResponse>(url)
  return Parsers.parseUsdPrice(resp)
}
