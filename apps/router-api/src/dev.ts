import type { FastifyListenOptions } from 'fastify'
import { createRouterApiServer } from './server'

process.loadEnvFile() // Load environment variables from .env file

const loadConfigFromEnv = ({ HOST, PORT = 3010 } = process.env): FastifyListenOptions => ({
  port: Number(PORT),
  host: HOST,
})

/**
 * Starts the Fastify server and sets up graceful shutdown handlers.
 * This function is invoked when running the application locally.
 * On Vercel, we use the server instance directly in the API route handler of the main app.
 */
async function start(): Promise<void> {
  const server = createRouterApiServer()

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
    const address = await server.listen(loadConfigFromEnv())
    server.log.info({ address }, 'Router API server ready')
  } catch (error) {
    server.log.error({ err: error }, 'Failed to start Router API server.')
    process.exit(1)
  }
}

// Kick off the bootstrap process.
void start()
