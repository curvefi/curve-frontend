import { buildServer, RouterApiServerConfig } from './server'

interface RuntimeConfig extends RouterApiServerConfig {
  port: number
  host: string
}

const DEFAULT_PORT = 3010
const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_SERVICE_NAME = 'router-api'
const DEFAULT_VERSION = '0.0.0'

const loadConfigFromEnv = (
  { npm_package_version, HOST, NODE_ENV, PORT, SERVICE_NAME } = process.env,
): RuntimeConfig => ({
  environment: NODE_ENV ?? 'development',
  port: PORT ? +PORT : DEFAULT_PORT,
  host: HOST ?? DEFAULT_HOST,
  serviceName: SERVICE_NAME ?? DEFAULT_SERVICE_NAME,
  version: npm_package_version ?? DEFAULT_VERSION,
})

async function start(): Promise<void> {
  const config = loadConfigFromEnv()
  const server = buildServer(config)

  const stopServer = async (signal: NodeJS.Signals) => {
    server.log.info({ signal }, 'Received shutdown signal. Closing server.')
    try {
      await server.close()
      server.log.info('Server closed successfully.')
      process.exit(0)
    } catch (error) {
      server.log.error({ err: error }, 'Error during server shutdown.')
      process.exit(1)
    }
  }

  process.on('SIGINT', stopServer)
  process.on('SIGTERM', stopServer)

  try {
    const address = await server.listen({ port: config.port, host: config.host })
    server.log.info({ address }, 'Router API server ready')
  } catch (error) {
    server.log.error({ err: error }, 'Failed to start Router API server.')
    process.exit(1)
  }
}

// Kick off the bootstrap process.
void start()
