import type { FastifyRequest } from 'fastify'
import { minBy, partition } from 'lodash'
import { FetchError } from '@primitives/fetch.utils'
import { handleTimeout } from '@primitives/objects.utils'
import { type RouterRouteResponse } from '@primitives/router.utils'
import { buildCurveRouteResponse } from '../curve-router/curve-router'
import { buildCurveSolverRouteResponse } from '../curve-solver-router/curve-solver-router'
import { buildEnsoRouteResponse } from '../enso-router/enso-router'
import { buildOdosRouteResponse } from '../odos-router/odos-router'
import { decimalCompare, decimalMax } from '../router.utils'
import { buildZeroExRouteResponse } from '../zeroex-router/zeroex-router'
import { type RoutesQuery } from './routes.schemas'

const ROUTE_TIMEOUT = 30_000 // 30 seconds

const routers = {
  curve: buildCurveRouteResponse,
  enso: buildEnsoRouteResponse,
  odos: buildOdosRouteResponse,
  '0x': buildZeroExRouteResponse,
  'curve-solver': buildCurveSolverRouteResponse,
}

const sortRoutes = (a: RouterRouteResponse, b: RouterRouteResponse) =>
  decimalCompare(decimalMax(...b.amountOut) ?? '0', decimalMax(...a.amountOut) ?? '0') ||
  (a.priceImpact ?? 100) - (b.priceImpact ?? 100)

function handleFailures(failures: PromiseRejectedResult[], router: string[]) {
  const reasons = failures.map((f): unknown => f.reason)
  const fetchError = minBy(
    reasons.filter((reason): reason is FetchError => reason instanceof FetchError),
    'status',
  )
  if (fetchError) {
    const { body, status: status } = fetchError
    return status >= 400 && status < 500 && body
      ? { status, data: body }
      : { status: status >= 500 ? 502 : 500, data: `Upstream failed with status ${status}` }
  }
  if (reasons.length === 1) throw reasons[0]
  throw new Error(`Failed to calculate route for ${router.join(', ')}: ${reasons.join('; ')}`)
}

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
  const [successes, failures] = partition(
    results,
    (res): res is PromiseFulfilledResult<RouterRouteResponse[]> => res.status === 'fulfilled',
  )

  failures.forEach(res => request.log.error({ message: 'route calculation failed', error: res.reason }))
  if (!successes.length) {
    return handleFailures(failures, router)
  }

  const result = successes.flatMap(p => p.value).sort(sortRoutes)
  request.log.info({ message: 'route calculated', query, result })
  return { status: 200, data: result }
}
