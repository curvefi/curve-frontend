import { FastifyBaseLogger } from 'fastify'
import { OptimalRouteQuery, RouteResponse } from '../routes/optimal-route.schemas'

/**
 * Calls the router to get the optimal route and builds the response.
 */
export const buildEnsoRouteResponse = async (
  query: OptimalRouteQuery,
  log: FastifyBaseLogger,
): Promise<RouteResponse[]> => []
