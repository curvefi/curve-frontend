// eslint-disable-next-line import-x/no-unresolved, local/isolated-packages -- Cloudflare provides this Worker runtime module.
import { httpServerHandler } from 'cloudflare:node'
import { createMerklServer } from 'merkl-api/src/server'
import { createRouterApiServer } from 'router-api/src/server'

function prepareApi(create: typeof createRouterApiServer, name: string) {
  const api = create({
    logger: false, // disable request logging in production, pino is not supported in CF and already logs every request.
    pluginTimeout: 0, // Cloudflare disallows the timer used by Fastify's default plugin timeout during module initialization.
  })

  const handler = httpServerHandler(api.server)
  api.addHook('onError', async (r, _reply, err) => console.error(`[${name}] ${r.method} ${r.url} failed`, err))

  const ready = api.ready()
  return async (request: Request) => {
    await ready
    return await handler.fetch(request)
  }
}

const routerApi = prepareApi(createRouterApiServer, 'router-api')
const merklApi = prepareApi(createMerklServer, 'merkl')

export default {
  fetch: async (request: Request): Promise<Response> =>
    new URL(request.url).pathname.startsWith('/api/merkl/') ? await merklApi(request) : await routerApi(request),
}
