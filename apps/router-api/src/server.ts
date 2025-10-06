import fastify, { FastifyInstance } from 'fastify'
import { registerOptimalRoute } from './routes/optimal-route'

export interface RouterApiServerConfig {
  serviceName: string
  environment: string
  version: string
  logLevel: string
}

/** Loads configuration from environment variables with defaults. */
const loadConfigFromEnv = (
  { npm_package_version, NODE_ENV, SERVICE_NAME, LOG_LEVEL } = process.env,
): RouterApiServerConfig => ({
  environment: NODE_ENV ?? 'development',
  serviceName: SERVICE_NAME ?? 'router-api',
  version: npm_package_version ?? '0.0.1',
  logLevel: LOG_LEVEL ?? (NODE_ENV === 'production' ? 'info' : 'debug'),
})

/**
 * Builds the Fastify instance with shared plugins and routes.
 */
export function buildServer(): FastifyInstance {
  const { environment, serviceName, version, logLevel } = loadConfigFromEnv()
  const server = fastify({ logger: { level: logLevel } })

  // Lightweight readiness probe so orchestration can determine service health.
  server.get('/health', async () => ({
    status: 'ok',
    service: serviceName,
    environment: environment,
    version: version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }))

  registerOptimalRoute(server)

  return server
}
