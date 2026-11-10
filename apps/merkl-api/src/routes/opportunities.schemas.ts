import { API_PREFIX } from '@api-server/routes.constants'

export const OPPORTUNITIES_PATH = `${API_PREFIX}merkl/v1/opportunities`

const opportunitiesQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    mainProtocolId: { type: 'string', minLength: 1, enum: ['curve', 'llamalend'] },
    test: { type: 'boolean' },
    status: { type: 'string', minLength: 1, enum: ['LIVE'] },
    action: { type: 'string', minLength: 1 },
    items: { type: 'integer', minimum: 1 },
    page: { type: 'integer', minimum: 0 },
  },
} as const

export type OpportunitiesQuery = {
  mainProtocolId?: string
  test?: boolean
  status?: string
  action?: string
  items?: number
  page?: number
}

const OpportunitiesSchema = { querystring: opportunitiesQuerySchema }

export const OpportunitiesOpts = { schema: OpportunitiesSchema } as const
