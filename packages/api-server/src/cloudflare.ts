import type { FastifyInstance } from 'fastify'

export const createCloudflareHandler = (
  createServer: (options: { logger: boolean; pluginTimeout: number }) => FastifyInstance,
  name: string,
  httpServerHandler: (server: FastifyInstance['server']) => { fetch(request: Request): Promise<Response> },
) => {
  const server = createServer({
    logger: false, // Cloudflare logs requests and does not support pino.
    pluginTimeout: 0, // Cloudflare disallows Fastify's plugin timeout during module initialization.
  })

  const handler = httpServerHandler(server.server)
  server.addHook('onError', async (r, _reply, err) => console.error(`[${name}] ${r.method} ${r.url} failed`, err))

  const ready = server.ready()
  return async (request: Request) => {
    await ready
    return await handler.fetch(request)
  }
}

/** First match wins. Paths ending in / match prefixes; other paths match exactly. */
export const createCloudflareWorker = (routes: [string, (request: Request) => Promise<Response>][]) => ({
  fetch: async (
    request: Request,
    { ASSETS }: { ASSETS: { fetch(request: Request): Promise<Response> } },
  ): Promise<Response> => {
    const { pathname } = new URL(request.url)
    const handler = routes.find(([path]) => pathname === path || (path.endsWith('/') && pathname.startsWith(path)))?.[1]
    return handler ? await handler(request) : await ASSETS.fetch(request)
  },
})
