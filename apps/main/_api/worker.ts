// eslint-disable-next-line import-x/no-unresolved, local/isolated-packages -- Cloudflare provides this Worker runtime module.
import { httpServerHandler } from 'cloudflare:node'
import { createRouterApiServer } from 'router-api/src/server'

// disable request logging in production, pino is not supported in CF and already logs every request.
const routerApi = createRouterApiServer({ logger: false })

routerApi.addHook('onError', (request, _reply, error) => {
  console.error(`[router-api] ${request.method} ${request.url} failed`, error)
})

await routerApi.ready()

const routerApiHandler = httpServerHandler(routerApi.server)

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)
    return pathname.startsWith('/api/router/')
      ? routerApiHandler.fetch(request)
      : new Response('Not Found', { status: 404 })
  },
}
