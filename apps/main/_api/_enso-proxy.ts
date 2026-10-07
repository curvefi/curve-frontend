const ENSO_API_URL = 'https://api.enso.build'
const PROXY_PREFIX = '/api/enso'
/** Only the quote endpoint is exposed, so the server-side key can't be used for anything else. */
const ALLOWED_PATHS = ['/api/v1/shortcuts/route']

/** Forwards a browser request to Enso with the API key added. Shared by the Vercel and Cloudflare handlers. */
export async function proxyEnso(url: URL, method: string, apiKey: string | undefined): Promise<Response> {
  const path = url.pathname.slice(PROXY_PREFIX.length)
  if (method !== 'GET' || !ALLOWED_PATHS.includes(path)) return new Response('Not found', { status: 404 })
  if (!apiKey) return new Response('ENSO_API_KEY is not configured', { status: 503 })
  const upstream = await fetch(`${ENSO_API_URL}${path}${url.search}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  })
}
