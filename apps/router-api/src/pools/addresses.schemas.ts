import { ADDRESS_HEX_PATTERN } from '@primitives/address.utils'

export const ADDRESSES_PATH = '/api/router/v1/pools/addresses'

export type AddressesQuery = { chainId: number }

const addressesQuerySchema = {
  type: 'object',
  required: ['chainId'],
  additionalProperties: false,
  properties: { chainId: { type: 'integer', minimum: 1 } },
} as const

const addressesResponseSchema = {
  type: 'array',
  items: { type: 'string', pattern: ADDRESS_HEX_PATTERN.source },
} as const

export const AddressesOpts = {
  schema: { querystring: addressesQuerySchema, response: { 200: addressesResponseSchema } },
} as const
