import { type IncomingMessage, ServerResponse } from 'http'
import { buildServer } from 'router-api/src/server'

const server = buildServer()

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const start = Date.now()
  await server.ready()
  server.server.emit('request', request, response)
  response.on('finish', () => console.info(`${request.method} ${request.url} - ${Date.now() - start}ms`))
}
