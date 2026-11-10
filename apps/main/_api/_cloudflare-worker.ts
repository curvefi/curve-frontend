/** This file is the entry point for the Cloudflare Worker runtime. It is prefixed with _ so it's ignored by Vercel. */
// eslint-disable-next-line import-x/no-unresolved, local/isolated-packages -- Cloudflare provides this Worker runtime module.
import { httpServerHandler } from 'cloudflare:node'
import { createCloudflareHandler, createCloudflareWorker } from '@api-server/cloudflare'
import { createMerklServer } from '@merkl-api/server'
import { createRouterApiServer } from '@router-api/server'

const routerApi = createCloudflareHandler(createRouterApiServer, 'router-api', httpServerHandler)
const merklApi = createCloudflareHandler(createMerklServer, 'merkl', httpServerHandler)

export default createCloudflareWorker([
  ['/api/merkl/', merklApi],
  ['/api/', routerApi],
  ['/api', routerApi],
  ['/health', routerApi],
])
