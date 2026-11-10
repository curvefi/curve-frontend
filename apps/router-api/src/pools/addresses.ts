import type { FastifyRequest } from 'fastify'
import { loadCurve } from '../curve-router/curvejs'
import type { AddressesQuery } from './addresses.schemas'

export const getPoolAddresses = async (request: FastifyRequest<{ Querystring: AddressesQuery }>) =>
  (await loadCurve(request.query.chainId, request.log)).poolAddresses
