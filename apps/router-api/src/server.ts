import { createApiServer } from '@curvefi/api-server'
import { getRoutes } from './routes/routes'
import { RoutesOpts, ROUTES_PATH, type RoutesQuery } from './routes/routes.schemas'

export const createRouterApiServer = (env = process.env) =>
  createApiServer({ serviceName: 'router-api', env }).get<{ Querystring: RoutesQuery }>(
    ROUTES_PATH,
    RoutesOpts,
    async (request, reply) => {
      const { status, data } = await getRoutes(request)
      return reply.code(status).send(data)
    },
  )
