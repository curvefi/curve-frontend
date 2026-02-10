import type { FastifyRequest } from 'fastify'
import lodash from 'lodash'
import { buildCurveRouteResponse } from '../curve-router/curve-router'
import { buildEnsoRouteResponse } from '../enso-router/enso-router'
import { buildOdosRouteResponse } from '../odos-router/odos-router'
import { handleTimeout } from '../router.utils'
import { type OptimalRouteQuery, type RouteResponse } from './optimal-route.schemas'

const ROUTE_TIMEOUT = 30_000 // 30 seconds

const routers = { curve: buildCurveRouteResponse, enso: buildEnsoRouteResponse, odos: buildOdosRouteResponse }

/**
 * Handles the optimal route request. Returns the optimal route for the given parameters.
 */
export const getOptimalRoute = async (request: FastifyRequest<{ Querystring: OptimalRouteQuery }>) => {
  const query = request.query
  const { router = ['curve'] } = query

  const results = await Promise.allSettled(
    router.map((router) =>
      handleTimeout(
        routers[router](query, request.log),
        ROUTE_TIMEOUT,
        `Route calculation for provider ${router} timed out`,
      ),
    ),
  )
  const [successes, failures] = lodash.partition(
    results,
    (res): res is PromiseFulfilledResult<RouteResponse[]> => res.status === 'fulfilled',
  )

  failures.forEach((res) => request.log.error({ message: 'route calculation failed', error: res.reason }))
  if (!successes.length) {
    const reasons = failures.map((f) => f.reason)
    if (reasons.length === 1) throw reasons[0]
    throw new Error(`Failed to calculate optimal route for ${router.join(', ')}: ${reasons.join('; ')}`)
  }

  const result = successes.flatMap((res) => res.value)
  request.log.info({ message: 'route calculated', query, result })
  return result
}
