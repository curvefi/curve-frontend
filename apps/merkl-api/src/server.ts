import { createApiServer } from '@curvefi/api-server'
import { getOpportunities } from './routes/opportunities'
import { OpportunitiesOpts, OPPORTUNITIES_PATH } from './routes/opportunities.schemas'

export const createMerklServer = (env = process.env) => {
  const { MERKL_API_KEY } = env

  if (!MERKL_API_KEY) throw new Error('Missing required environment variable MERKL_API_KEY')

  return createApiServer({ serviceName: 'merkl-api', env }).get(
    OPPORTUNITIES_PATH,
    OpportunitiesOpts,
    getOpportunities({ MERKL_API_KEY }),
  )
}
