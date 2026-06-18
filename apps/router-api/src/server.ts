import { createApiServer } from '@curvefi/api-server'
import { getRoutes } from './routes/routes'
import { RoutesOpts, RoutesPath } from './routes/routes.schemas'

export const createRouterApiServer = (env = process.env) =>
  createApiServer({ serviceName: 'router-api', env }).get(RoutesPath, RoutesOpts, getRoutes)
