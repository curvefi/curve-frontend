import { ADDRESS_HEX_PATTERN } from '@primitives/address.utils'

export const TOKENS_PATH = '/api/router/v1/tokens'

export type TokensQuery = { chainId: number }

const tokensQuerySchema = {
  type: 'object',
  required: ['chainId'],
  additionalProperties: false,
  properties: { chainId: { type: 'integer', minimum: 1 } },
} as const

const tokenMetadataSchema = {
  type: 'object',
  required: ['decimals', 'symbol', 'name'],
  additionalProperties: false,
  properties: {
    decimals: { type: 'integer', minimum: 0 },
    symbol: { type: 'string' },
    name: { type: 'string' },
    lp: { type: 'boolean', const: true },
  },
} as const

const tokensResponseSchema = {
  type: 'object',
  additionalProperties: false,
  patternProperties: { [ADDRESS_HEX_PATTERN.source]: tokenMetadataSchema },
} as const

export const TokensOpts = {
  schema: { querystring: tokensQuerySchema, response: { 200: tokensResponseSchema } },
} as const
