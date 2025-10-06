import fastify, { FastifyInstance } from 'fastify'

export interface RouterApiServerConfig {
  serviceName: string
  environment: string
  version: string
}

/**
 * Builds the Fastify instance with shared plugins and routes.
 */
export function buildServer({ environment, serviceName, version }: RouterApiServerConfig): FastifyInstance {
  const server = fastify({
    logger: {
      level: environment === 'production' ? 'info' : 'debug',
    },
    ajv: {
      customOptions: {
        coerceTypes: 'array',
      },
    },
  })

  // Lightweight readiness probe so orchestration can determine service health.
  server.get('/health', async () => ({
    status: 'ok',
    service: serviceName,
    environment: environment,
    version: version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }))

  return server
}
