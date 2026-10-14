import { createApiServer } from '@curvefi/api-server'
import { getPoolAddresses } from './pools/addresses'
import { AddressesOpts, ADDRESSES_PATH, type AddressesQuery } from './pools/addresses.schemas'
import { getRoutes } from './routes/routes'
import { RoutesOpts, ROUTES_PATH, type RoutesQuery } from './routes/routes.schemas'
import { getTokens } from './tokens/tokens'
import { TokensOpts, TOKENS_PATH, type TokensQuery } from './tokens/tokens.schemas'

type CreateRouterApiServerOptions = { env?: typeof process.env; logger?: boolean; pluginTimeout?: number }

export const createRouterApiServer = ({
  env = process.env,
  logger = true,
  pluginTimeout,
}: CreateRouterApiServerOptions = {}) =>
  createApiServer({ serviceName: 'router-api', env, logger, pluginTimeout })
    .get<{ Querystring: AddressesQuery }>(ADDRESSES_PATH, AddressesOpts, getPoolAddresses)
    .get<{ Querystring: RoutesQuery }>(ROUTES_PATH, RoutesOpts, getRoutes)
    .get<{ Querystring: TokensQuery }>(TOKENS_PATH, TokensOpts, getTokens)
