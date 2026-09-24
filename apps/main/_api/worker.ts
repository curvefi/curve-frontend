// eslint-disable-next-line import-x/no-unresolved, local/isolated-packages -- Cloudflare provides this Worker runtime module.
import { httpServerHandler } from 'cloudflare:node'
import { createRouterApiServer } from 'router-api/src/server'

const routerApi = createRouterApiServer()
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
