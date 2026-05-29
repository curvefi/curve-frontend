import createFastify from 'fastify'
import { getRoutes } from './routes/routes'
import { RoutesOpts, RoutesPath } from './routes/routes.schemas'

export const createRouterApiServer = ({ npm_package_version, NODE_ENV, SERVICE_NAME, LOG_LEVEL } = process.env) =>
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
  createFastify({ logger: { level: LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug') } })
    .get('/health', async () => ({
      status: 'ok',
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
      service: SERVICE_NAME || 'router-api',
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
      environment: NODE_ENV || 'development',
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
      version: npm_package_version || '0.0.1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }))
    .get(RoutesPath, RoutesOpts, getRoutes)
