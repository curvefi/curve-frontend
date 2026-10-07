/** This file is the entry point for the Cloudflare Worker runtime. It is prefixed with _ so it's ignored by Vercel. */
// eslint-disable-next-line import-x/no-unresolved, local/isolated-packages -- Cloudflare provides this Worker runtime module.
import { httpServerHandler } from 'cloudflare:node'
import { createMerklServer } from 'merkl-api/src/server'
import { createRouterApiServer } from 'router-api/src/server'
import { proxyEnso } from './_enso-proxy'

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
  fetch: async (
    request: Request,
    { ASSETS, ENSO_API_KEY }: { ASSETS: { fetch(request: Request): Promise<Response> }; ENSO_API_KEY?: string },
  ): Promise<Response> => {
    const url = new URL(request.url)
    const { pathname } = url
    return pathname.startsWith('/api/merkl/')
      ? await merklApi(request)
      : pathname.startsWith('/api/enso/')
        ? await proxyEnso(url, request.method, ENSO_API_KEY)
        : ['/api', '/health'].includes(pathname) || pathname.startsWith('/api/')
          ? await routerApi(request)
          : await ASSETS.fetch(request) // forward any non-API requests to the frontend
  },
}
