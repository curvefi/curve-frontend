import { createApiServer } from '@api-server/server'
import { getOpportunities } from './routes/opportunities'
import { OpportunitiesOpts, OPPORTUNITIES_PATH } from './routes/opportunities.schemas'

type CreateMerklServerOptions = { env?: typeof process.env; logger?: boolean; pluginTimeout?: number }

export const createMerklServer = ({
  env = process.env,
  logger = true,
  pluginTimeout,
}: CreateMerklServerOptions = {}) => {
  const { MERKL_API_KEY } = env

  return createApiServer({ serviceName: 'merkl-api', env, logger, pluginTimeout }).get(
    OPPORTUNITIES_PATH,
    OpportunitiesOpts,
    getOpportunities({ MERKL_API_KEY }),
  )
}
