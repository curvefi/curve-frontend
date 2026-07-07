import { createApiServer } from '@curvefi/api-server'
import { getRoutes } from './routes/routes'
import { RoutesOpts, RoutesPath, type RoutesQuery } from './routes/routes.schemas'

export const createRouterApiServer = (env = process.env) =>
  createApiServer({ serviceName: 'router-api', env }).get<{ Querystring: RoutesQuery }>(
    RoutesPath,
    RoutesOpts,
    async (request, reply) => {
      const { status, data } = await getRoutes(request)
      return reply.code(status).send(data)
    },
  )
