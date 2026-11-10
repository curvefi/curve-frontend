import { PUBLIC_CACHE_CONTROL } from '@api-server/cache.constants'
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

  if (!MERKL_API_KEY) throw new Error('Missing required environment variable MERKL_API_KEY')

  return createApiServer({ serviceName: 'merkl-api', env, logger, pluginTimeout })
    .addHook('onSend', async (request, reply, payload) => {
      const cacheable = reply.statusCode === 200 && request.routeOptions.url === OPPORTUNITIES_PATH
      reply.header('Cache-Control', cacheable ? PUBLIC_CACHE_CONTROL : 'no-store')
      return payload
    })
    .get(OPPORTUNITIES_PATH, OpportunitiesOpts, getOpportunities({ MERKL_API_KEY }))
}
