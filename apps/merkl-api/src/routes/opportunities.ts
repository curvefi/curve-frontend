import type { FastifyReply, FastifyRequest } from 'fastify'
import type { OpportunitiesQuery } from './opportunities.schemas'

const DEFAULT_MERKL_API_URL = 'https://api.merkl.xyz'

type MerklConfig = {
  MERKL_API_URL?: string
  MERKL_API_KEY?: string
}

const buildMerklOpportunitiesUrl = (baseUrl: string, query: OpportunitiesQuery) => {
  const url = new URL(`${baseUrl.replace(/\/+$/, '')}/v4/opportunities`)
  Object.entries(query).forEach(([key, value]) => {
    if (value != null) url.searchParams.set(key, String(value))
  })
  return url.toString()
}

export const getOpportunities =
  ({ MERKL_API_URL = DEFAULT_MERKL_API_URL, MERKL_API_KEY }: MerklConfig = {}) =>
  async (request: FastifyRequest<{ Querystring: OpportunitiesQuery }>, reply: FastifyReply) => {
    const url = buildMerklOpportunitiesUrl(MERKL_API_URL, request.query)
    const headers: Record<string, string> = { accept: 'application/json' }
    if (MERKL_API_KEY) headers['X-API-Key'] = MERKL_API_KEY

    const response = await fetch(url, { method: 'GET', headers })
    const { ok, status, statusText } = response

    if (!ok) {
      const body = await response.text()
      request.log.error({
        message: 'Merkl opportunities request failed',
        status,
        statusText,
        url,
        body,
        authenticated: !!MERKL_API_KEY,
      })
      return reply.code(status).send({
        statusCode: status,
        error: statusText || 'Merkl API Error',
        message: `Merkl opportunities request failed with status ${status}`,
      })
    }

    const payload: unknown = await response.json()
    return payload
  }
