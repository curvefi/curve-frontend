import type { FastifyRequest } from 'fastify'
import lodash from 'lodash'
import { handleTimeout } from '@primitives/objects.utils'
import type { RouteResponse, RouterRouteResponse } from '@primitives/router.utils'
import { buildCurveRouteResponse } from '../curve-router/curve-router'
import { buildEnsoRouteResponse } from '../enso-router/enso-router'
import { buildOdosRouteResponse } from '../odos-router/odos-router'
import { decimalCompare, decimalMax, generateId } from '../router.utils'
import { type RoutesQuery } from './routes.schemas'

const ROUTE_TIMEOUT = 30_000 // 30 seconds

const routers = { curve: buildCurveRouteResponse, enso: buildEnsoRouteResponse, odos: buildOdosRouteResponse }

export const sortRoutes = (a: RouteResponse, b: RouteResponse) =>
  decimalCompare(decimalMax(...b.amountOut) ?? '0', decimalMax(...a.amountOut) ?? '0') ||
  (a.priceImpact ?? 100) - (b.priceImpact ?? 100)

const addRouteId =
  (query: RoutesQuery) =>
  async (response: RouterRouteResponse): Promise<RouteResponse> => ({
    ...response,
    id: await generateId(query, response),
  })

/**
 * Handles the routes request. Returns the best routes for the given parameters.
 */
export const getRoutes = async (request: FastifyRequest<{ Querystring: RoutesQuery }>) => {
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
    (res): res is PromiseFulfilledResult<RouterRouteResponse[]> => res.status === 'fulfilled',
  )

  failures.forEach((res) => request.log.error({ message: 'route calculation failed', error: res.reason }))
  if (!successes.length) {
    const reasons = failures.map((f) => f.reason)
    if (reasons.length === 1) throw reasons[0]
    throw new Error(`Failed to calculate route for ${router.join(', ')}: ${reasons.join('; ')}`)
  }

  const items = await Promise.all(successes.flatMap((p) => p.value).map(addRouteId(query)))
  const result = items.sort(sortRoutes)
  request.log.info({ message: 'route calculated', query, result })
  return result
}
