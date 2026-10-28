import type { IncomingMessage, ServerResponse } from 'node:http'
import type { FastifyInstance } from 'fastify'

/** Vercel API handler. During development, Vite proxies requests to the local API servers. */
export const createVercelHandler =
  (server: FastifyInstance) => async (request: IncomingMessage, response: ServerResponse) => {
    const start = Date.now()
    await server.ready()
    server.server.emit('request', request, response)
    response.on('finish', () =>
      server.log.info({
        message: 'request finished',
        method: request.method,
        path: request.url,
        runtimeMs: Date.now() - start,
      }),
    )
  }
