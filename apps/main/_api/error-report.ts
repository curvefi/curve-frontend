import { type IncomingMessage, ServerResponse } from 'http'
import { json } from 'node:stream/consumers'

const sendJson = (response: ServerResponse, statusCode: number, payload: unknown) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

/**
 * API handler to receive error reports submitted from the UI.
 * For now, it just logs them to the console on the server-side.
 */
export async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method Not Allowed' })
  }
  try {
    const report = await json(request)
    console.info({ message: 'error report received', report })
    sendJson(response, 200, { status: 'ok' })
  } catch (error) {
    console.warn({ message: 'failed to parse error report', error })
    sendJson(response, 400, { error: 'Invalid JSON payload' })
  }
}
