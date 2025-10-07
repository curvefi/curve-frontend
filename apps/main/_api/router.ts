import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildServer } from 'router-api/src/server'

const server = buildServer()

export default async function handler(request: VercelRequest, response: VercelResponse) {
  await server.ready()
  server.server.emit('request', request, response)
  console.info(`${request.method} ${request.url}`)
}
