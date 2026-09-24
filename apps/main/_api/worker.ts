// eslint-disable-next-line import-x/no-unresolved, local/isolated-packages -- Cloudflare provides this Worker runtime module.
import { httpServerHandler } from 'cloudflare:node'
import { createRouterApiServer } from 'router-api/src/server'

// disable request logging in production, pino is not supported in CF and already logs every request.
// Cloudflare disallows the timer used by Fastify's default plugin timeout during module initialization.
const routerApi = createRouterApiServer({ logger: false, pluginTimeout: 0 })

routerApi.addHook('onError', async ({ method, url }, _reply, err) =>
  console.error(`[router-api] ${method} ${url} failed`, err),
)

const routerApiHandler = httpServerHandler(routerApi.server)
const routerApiReady = routerApi.ready()

export default {
  async fetch(request: Request): Promise<Response> {
    await routerApiReady
    return await routerApiHandler.fetch(request)
  },
}
