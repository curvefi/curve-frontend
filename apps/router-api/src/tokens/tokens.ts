import type { FastifyRequest } from 'fastify'
import { getAddress, zeroAddress } from 'viem'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import type { TokenMetadata, TokensResponse } from '@primitives/tokens'
import { loadCurve } from '../curve-router/curvejs'
import type { TokensQuery } from './tokens.schemas'

/** Build the token catalog from the metadata already loaded by the shared Curve.js instance. */
export const getTokens = async (request: FastifyRequest<{ Querystring: TokensQuery }>): Promise<TokensResponse> => {
  const curve = await loadCurve(request.query.chainId, request.log)
  const { NATIVE_TOKEN: nativeToken, DECIMALS: decimals } = curve.getNetworkConstants()
  const pools = curve.getPoolList().map(id => curve.getPool(id))
  const tokens: TokensResponse = {}

  const addToken = (address: string, symbol: string, tokenDecimals: number, metadata?: Partial<TokenMetadata>) => {
    const checksummedAddress = getAddress(address)
    const label = symbol || shortenString(checksummedAddress)
    tokens[checksummedAddress] = { decimals: tokenDecimals, symbol: label, name: label, ...metadata }
  }

  addToken(nativeToken.address, nativeToken.symbol, decimals[nativeToken.address] ?? DEFAULT_DECIMALS)
  addToken(
    nativeToken.wrappedAddress,
    nativeToken.wrappedSymbol,
    decimals[nativeToken.wrappedAddress] ?? DEFAULT_DECIMALS,
  )

  for (const pool of pools) {
    pool.underlyingCoinAddresses.forEach((address, index) =>
      addToken(address, pool.underlyingCoins[index], pool.underlyingDecimals[index]),
    )
    pool.wrappedCoinAddresses.forEach((address, index) =>
      addToken(address, pool.wrappedCoins[index], pool.wrappedDecimals[index]),
    )
  }

  // An LP token can also be a pool coin; its LP label must win regardless of pool traversal order.
  for (const pool of pools) {
    if (pool.lpToken === zeroAddress) continue
    addToken(pool.lpToken, pool.symbol, decimals[pool.lpToken] ?? DEFAULT_DECIMALS, {
      name: `${pool.id} LP`,
      lp: true,
    })
  }

  return tokens
}
