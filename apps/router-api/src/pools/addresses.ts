import type { FastifyRequest } from 'fastify'
import { getAddress } from 'viem'
import { loadCurve } from '../curve-router/curvejs'
import type { AddressesQuery } from './addresses.schemas'

export const getPoolAddresses = async (request: FastifyRequest<{ Querystring: AddressesQuery }>) => {
  const { curve } = await loadCurve(request.query.chainId, request.log)
  return curve.getPoolList().map(poolId => getAddress(curve.getPool(poolId).address))
}
