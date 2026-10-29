import type { FastifyRequest } from 'fastify'
import { getAddress } from 'viem'
import { loadCurve } from '../curve-router/curvejs'
import type { AddressesQuery } from './addresses.schemas'

export const getPoolAddresses = async (request: FastifyRequest<{ Querystring: AddressesQuery }>) => {
  const { curve } = await loadCurve(request.query.chainId, request.log)
  const poolsData = curve.getPoolsData()
  return curve.getPoolList().map(id => getAddress(poolsData[id].swap_address))
}
