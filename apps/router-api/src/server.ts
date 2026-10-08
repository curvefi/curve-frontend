import { createApiServer } from '@curvefi/api-server'
import { getClmmMigration } from './clmm-migration/clmm-migration'
import {
  CLMM_MIGRATION_PATH,
  ClmmMigrationOpts,
  type ClmmMigrationQuery,
} from './clmm-migration/clmm-migration.schemas'
import { getRoutes } from './routes/routes'
import { RoutesOpts, ROUTES_PATH, type RoutesQuery } from './routes/routes.schemas'
import { getTokens } from './tokens/tokens'
import { TokensOpts, TOKENS_PATH, type TokensQuery } from './tokens/tokens.schemas'
import { getUniswapV3Pools } from './uniswap-pools/uniswap-pools'
import {
  UNISWAP_V3_POOLS_PATH,
  UniswapV3PoolsOpts,
  type UniswapV3PoolsQuery,
} from './uniswap-pools/uniswap-pools.schemas'

type CreateRouterApiServerOptions = { env?: typeof process.env; logger?: boolean; pluginTimeout?: number }

export const createRouterApiServer = ({
  env = process.env,
  logger = true,
  pluginTimeout,
}: CreateRouterApiServerOptions = {}) =>
  createApiServer({ serviceName: 'router-api', env, logger, pluginTimeout })
    .get<{ Querystring: RoutesQuery }>(ROUTES_PATH, RoutesOpts, getRoutes)
    .get<{ Querystring: TokensQuery }>(TOKENS_PATH, TokensOpts, getTokens)
    .get<{ Querystring: ClmmMigrationQuery }>(CLMM_MIGRATION_PATH, ClmmMigrationOpts, getClmmMigration)
    .get<{ Querystring: UniswapV3PoolsQuery }>(UNISWAP_V3_POOLS_PATH, UniswapV3PoolsOpts, getUniswapV3Pools)
