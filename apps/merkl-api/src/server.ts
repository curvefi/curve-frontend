import createFastify from 'fastify'
import { getOpportunities } from './routes/opportunities'
import { OpportunitiesOpts, OpportunitiesPath } from './routes/opportunities.schemas'

export const createMerklServer = (
  { npm_package_version, NODE_ENV, SERVICE_NAME, LOG_LEVEL, MERKL_API_URL, MERKL_API_KEY } = process.env,
) =>
  createFastify({ logger: { level: LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug') } })
    .get('/health', () => ({
      status: 'ok',
      service: SERVICE_NAME || 'merkl-api',
      environment: NODE_ENV || 'development',
      version: npm_package_version || '0.0.1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }))
    .get(OpportunitiesPath, OpportunitiesOpts, getOpportunities({ MERKL_API_URL, MERKL_API_KEY }))
