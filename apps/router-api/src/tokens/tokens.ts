import type { FastifyRequest } from 'fastify'
import { getPoolFilters } from '@curvefi/prices-api/chains'
import { listPoolChains } from '@curvefi/prices-api/pools'
import { getLiteTokens } from './lite-tokens'
import { getNativeTokens } from './native-tokens'
import { getPricesTokens } from './prices-tokens'
import type { TokensQuery } from './tokens.schemas'

export const getTokens = async (request: FastifyRequest<{ Querystring: TokensQuery }>) => {
  const { chainId } = request.query
  const [chains, filters] = await Promise.all([listPoolChains(), getPoolFilters()])
  const blacklist = new Set(filters.filter(pool => pool.chainId === chainId).map(pool => pool.address.toLowerCase()))
  const chain = chains.find(chain => chain.chainId === chainId)

  const [tokens, nativeTokens] = await Promise.all([
    chain ? getPricesTokens(chain, blacklist) : getLiteTokens(chainId, blacklist),
    getNativeTokens(chainId),
  ])

  return { ...nativeTokens, ...tokens }
}
