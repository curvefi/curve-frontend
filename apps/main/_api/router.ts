import { type IncomingMessage, ServerResponse } from 'http'
import { createRouterApiServer } from 'router-api/src/server'

const server = createRouterApiServer()

/**
 * Vercel handler for API routes, using fastify under the hood. This is only used when deployed to Vercel.
 * While in development, vite's dev server redirects /api/* calls to the router-api dev server.
 * This file is automatically detected by vite-plugin-vercel because it is in the "_api" folder.
 */
export async function handler(request: IncomingMessage, response: ServerResponse) {
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
