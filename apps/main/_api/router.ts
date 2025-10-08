import { buildServer } from 'router-api/src/server'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const server = buildServer()

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const start = Date.now()
  await server.ready()
  server.server.emit('request', request, response)
  response.on('finish', () => console.info(`${request.method} ${request.url} - ${Date.now() - start}ms`))
}
