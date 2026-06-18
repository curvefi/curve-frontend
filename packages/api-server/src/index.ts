import createFastify, { type FastifyInstance } from 'fastify'

type ApiServerEnv = Partial<
  Record<'LOG_LEVEL' | 'NODE_ENV' | 'SERVICE_NAME' | 'npm_package_version', string | undefined>
>

type DevServerEnv = Partial<Record<'HOST' | 'PORT', string | undefined>>

export const createApiServer = ({ serviceName, env = process.env }: { serviceName: string; env?: ApiServerEnv }) => {
  const { LOG_LEVEL, NODE_ENV, SERVICE_NAME, npm_package_version } = env

  return createFastify({ logger: { level: LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug') } }).get(
    '/health',
    () => ({
      status: 'ok',
      service: SERVICE_NAME || serviceName,
      environment: NODE_ENV || 'development',
      version: npm_package_version || '0.0.1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  )
}

/**
 * Starts a Fastify server locally and sets up graceful shutdown handlers.
 * On Vercel, apps use their server instances directly in API route handlers.
 */
export async function startDevServer({
  createServer,
  defaultPort,
  readyMessage,
  failureMessage,
  env = process.env,
}: {
  createServer: () => FastifyInstance
  defaultPort: number
  readyMessage: string
  failureMessage: string
  env?: DevServerEnv
}): Promise<void> {
  process.loadEnvFile()

  const server = createServer()

  const stopServer = (signal: NodeJS.Signals) => {
    server.log.info({ signal }, 'Received shutdown signal. Closing server.')
    server.close().then(
      () => {
        server.log.info('Server closed successfully.')
        process.exit(0)
      },
      error => {
        server.log.error({ err: error }, 'Error during server shutdown.')
        process.exit(1)
      },
    )
  }

  process.on('SIGINT', stopServer)
  process.on('SIGTERM', stopServer)

  try {
    const address = await server.listen({
      port: Number(env.PORT ?? defaultPort),
      host: env.HOST,
    })
    server.log.info({ address }, readyMessage)
  } catch (error) {
    server.log.error({ err: error }, failureMessage)
    process.exit(1)
  }
}
