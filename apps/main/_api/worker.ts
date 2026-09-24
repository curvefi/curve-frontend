type Env = { ASSETS: { fetch(request: Request): Promise<Response> } }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (pathname === 'api/router/v1/routes') {
      return Response.json([])
    }
    console.log('Worker fetch request', request.url, request.method, request.headers.get('referer'))

    return env.ASSETS.fetch(request)
  },
}
