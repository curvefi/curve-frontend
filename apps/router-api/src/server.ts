import { createApiServer } from '@curvefi/api-server'
import { getRoutes } from './routes/routes'
import { RoutesOpts, ROUTES_PATH } from './routes/routes.schemas'

export const createRouterApiServer = (env = process.env) =>
  createApiServer({ serviceName: 'router-api', env }).get(ROUTES_PATH, RoutesOpts, getRoutes)
