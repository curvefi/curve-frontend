import type { IncomingMessage, ServerResponse } from 'http'
import { proxyEnso } from './_enso-proxy'

/**
 * Vercel handler for the Enso quote proxy. While in development, vite's dev server proxies /api/enso/* instead.
 * This handler is registered from the "_api" folder in vite.config.ts.
 */
export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const upstream = await proxyEnso(
    new URL(request.url ?? '/', 'http://localhost'),
    request.method ?? 'GET',
    process.env.ENSO_API_KEY,
  )
  response.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('Content-Type') ?? 'text/plain' })
  response.end(await upstream.text())
}
