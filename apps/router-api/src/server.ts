import { createApiServer } from '@curvefi/api-server'
import { getRoutes } from './routes/routes'
import { RoutesOpts, ROUTES_PATH, type RoutesQuery } from './routes/routes.schemas'
import { getTokens } from './tokens/tokens'
import { TokensOpts, TOKENS_PATH, type TokensQuery } from './tokens/tokens.schemas'

type CreateRouterApiServerOptions = { env?: typeof process.env; logger?: boolean }

export const createRouterApiServer = ({ env = process.env, logger = true }: CreateRouterApiServerOptions = {}) =>
  createApiServer({ serviceName: 'router-api', env, logger })
    .get<{ Querystring: RoutesQuery }>(ROUTES_PATH, RoutesOpts, getRoutes)
    .get<{ Querystring: TokensQuery }>(TOKENS_PATH, TokensOpts, getTokens)
