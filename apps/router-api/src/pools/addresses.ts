import type { FastifyRequest } from 'fastify'
import { getAddress } from 'viem'
import { loadCurve } from '../curve-router/curvejs'
import { getPoolsData } from '../curve-router/pool-data'
import type { AddressesQuery } from './addresses.schemas'

export const getPoolAddresses = async (request: FastifyRequest<{ Querystring: AddressesQuery }>) => {
  const { curve } = await loadCurve(request.query.chainId, request.log)
  return getPoolsData(curve).map(pool => getAddress(pool.swap_address))
}
