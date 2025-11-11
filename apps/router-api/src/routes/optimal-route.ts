import type { FastifyRequest } from 'fastify'
import { buildCurveRouteResponse } from '../curve-router/curve-router'
import { buildEnsoRouteResponse } from '../enso-router/enso-router'
import { handleTimeout } from '../router.utils'
import { type OptimalRouteQuery, type RouteResponse } from './optimal-route.schemas'

const ROUTE_TIMEOUT = 30_000 // 30 seconds

const routers = {
  curve: buildCurveRouteResponse,
  enso: buildEnsoRouteResponse,
}

/**
 * Handles the optimal route request. Returns the optimal route for the given parameters.
 */
export const getOptimalRoute = async (request: FastifyRequest<{ Querystring: OptimalRouteQuery }>) => {
  const query = request.query
  const { router = ['curve'] } = query

  const results = await Promise.allSettled(
    router.map((provider) =>
      handleTimeout(
        routers[provider](query, request.log),
        ROUTE_TIMEOUT,
        `Route calculation for provider ${provider} timed out`,
      ),
    ),
  )
  results
    .filter((res): res is PromiseRejectedResult => res.status === 'rejected')
    .forEach((res) => request.log.error({ message: 'route calculation failed', error: res.reason }))

  const result = results
    .filter((res): res is PromiseFulfilledResult<RouteResponse[]> => res.status === 'fulfilled')
    .flatMap((res) => res.value)
  request.log.info({ message: 'route calculated', query, result })
  return result
}
