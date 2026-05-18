import type { FastifyRequest } from 'fastify'
import lodash from 'lodash'
import { handleTimeout } from '@primitives/objects.utils'
import { type RouterRouteResponse } from '@primitives/router.utils'
import { buildCurveRouteResponse } from '../curve-router/curve-router'
import { buildCurveSolverRouteResponse } from '../curve-solver-router/curve-solver-router'
import { buildEnsoRouteResponse } from '../enso-router/enso-router'
import { buildOdosRouteResponse } from '../odos-router/odos-router'
import { decimalCompare, decimalMax } from '../router.utils'
import { type RoutesQuery } from './routes.schemas'

const ROUTE_TIMEOUT = 30_000 // 30 seconds

const routers = {
  curve: buildCurveRouteResponse,
  'curve-solver': buildCurveSolverRouteResponse,
  enso: buildEnsoRouteResponse,
  odos: buildOdosRouteResponse,
}

const sortRoutes = (a: RouterRouteResponse, b: RouterRouteResponse) =>
  decimalCompare(decimalMax(...b.amountOut) ?? '0', decimalMax(...a.amountOut) ?? '0') ||
  (a.priceImpact ?? 100) - (b.priceImpact ?? 100)

/**
 * Handles the routes request. Returns the best routes for the given parameters.
 */
export const getRoutes = async (request: FastifyRequest<{ Querystring: RoutesQuery }>) => {
  const query = request.query
  const { router = ['curve'] } = query

  const results = await Promise.allSettled(
    router.map(router =>
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

  failures.forEach(res => request.log.error({ message: 'route calculation failed', error: res.reason }))
  if (!successes.length) {
    const reasons = failures.map(f => f.reason)
    if (reasons.length === 1) throw reasons[0]
    throw new Error(`Failed to calculate route for ${router.join(', ')}: ${reasons.join('; ')}`)
  }

  const result = successes.flatMap(p => p.value).sort(sortRoutes)
  request.log.info({ message: 'route calculated', query, result })
  return result
}
