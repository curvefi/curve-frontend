import fastify from 'fastify'
import { getOptimalRoute } from './routes/optimal-route'
import { OptimalRouteOpts, OptimalRoutePath } from './routes/optimal-route.schemas'

export const createRouterApiServer = ({ npm_package_version, NODE_ENV, SERVICE_NAME, LOG_LEVEL } = process.env) =>
  fastify({ logger: { level: LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug') } })
    .get('/health', async () => ({
      status: 'ok',
      service: SERVICE_NAME || 'router-api',
      environment: NODE_ENV || 'development',
      version: npm_package_version || '0.0.1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }))
    .get(OptimalRoutePath, OptimalRouteOpts, getOptimalRoute)
