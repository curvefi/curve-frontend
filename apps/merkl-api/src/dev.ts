import type { FastifyListenOptions } from 'fastify'
import { createMerklServer } from './server'

process.loadEnvFile()

const loadConfigFromEnv = ({ HOST, PORT = 3011 } = process.env): FastifyListenOptions => ({
  port: Number(PORT),
  host: HOST,
})

/**
 * Starts the Fastify server and sets up graceful shutdown handlers.
 * This function is invoked when running the application locally.
 * On Vercel, we use the server instance directly in the API route handler of the main app.
 */
async function start(): Promise<void> {
  const server = createMerklServer()

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
    const address = await server.listen(loadConfigFromEnv())
    server.log.info({ address }, 'Merkl API server ready')
  } catch (error) {
    server.log.error({ err: error }, 'Failed to start Merkl API server.')
    process.exit(1)
  }
}

// Kick off the bootstrap process.
void start()
