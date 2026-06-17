export const OpportunitiesPath = '/api/merkl/v1/opportunities'

const opportunitiesQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    mainProtocolId: { type: 'string', minLength: 1 },
    test: { type: 'boolean' },
    status: { type: 'string', minLength: 1 },
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

const OpportunitiesSchema = {
  querystring: opportunitiesQuerySchema,
}

export const OpportunitiesOpts = { schema: OpportunitiesSchema } as const
