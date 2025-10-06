import { IncomingMessage, ServerResponse } from 'node:http'
import { buildServer } from './server'

const server = buildServer()

/**
 * Vercel serverless function handler that delegates requests to the Fastify server instance.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await server.ready()
  server.server.emit('request', req, res)
}
