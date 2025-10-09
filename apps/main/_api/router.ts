import { type IncomingMessage, ServerResponse } from 'http'
import { buildServer } from 'router-api/src/server'

const server = buildServer()

/**
 * Vercel handler for API routes, using fastify under the hood. This is only used when deployed to Vercel.
 * While in development, vite's dev server redirects /api/* calls to the router-api dev server.
 */
export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const start = Date.now()
  await server.ready()
  server.server.emit('request', request, response)
  response.on('finish', () => console.info(`${request.method} ${request.url} - ${Date.now() - start}ms`))
}
