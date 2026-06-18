import { createApiServer } from '@curvefi/api-server'
import { getOpportunities } from './routes/opportunities'
import { OpportunitiesOpts, OpportunitiesPath } from './routes/opportunities.schemas'

export const createMerklServer = (env = process.env) => {
  const { MERKL_API_KEY } = env

  if (!MERKL_API_KEY) throw new Error('Missing required environment variable MERKL_API_KEY')

  return createApiServer({ serviceName: 'merkl-api', env }).get(
    OpportunitiesPath,
    OpportunitiesOpts,
    getOpportunities({ MERKL_API_KEY }),
  )
}
