import { type Address, ADDRESS_HEX_PATTERN } from '@primitives/address.utils'
import { DECIMAL_REGEX } from '@primitives/decimal.utils'
import { type ClmmProtocol, ClmmProtocols } from '@primitives/router.utils'

export const CLMM_MIGRATION_PATH = '/api/router/v1/clmm-migration'

const AddressSchema = { type: 'string', pattern: ADDRESS_HEX_PATTERN.source } as const
const IntegerStringSchema = { type: 'string', pattern: '^\\d+$' } as const
const DecimalSchema = { type: 'string', pattern: DECIMAL_REGEX.source } as const

export type ClmmMigrationQuery = {
  chainId: number
  protocol: ClmmProtocol
  positionManager: Address
  tokenId: string
  liquidity: string
  tokens: [Address, Address]
  tokenOut: Address
  userAddress: Address
  /** Percent. */
  slippage: number
}

const clmmMigrationQuerySchema = {
  type: 'object',
  required: ['chainId', 'protocol', 'positionManager', 'tokenId', 'liquidity', 'tokens', 'tokenOut', 'userAddress'],
  additionalProperties: false,
  properties: {
    chainId: { type: 'integer', minimum: 1 },
    protocol: { type: 'string', enum: ClmmProtocols },
    positionManager: AddressSchema,
    tokenId: IntegerStringSchema,
    liquidity: IntegerStringSchema,
    tokens: { type: 'array', items: AddressSchema, minItems: 2, maxItems: 2 },
    tokenOut: AddressSchema,
    userAddress: AddressSchema,
    slippage: { type: 'number', minimum: 0, maximum: 50, default: 0.5 },
  },
} as const

const clmmMigrationResponseSchema = {
  type: 'object',
  required: ['routerFeePercentage', 'amountOut', 'minAmountOut', 'gas', 'tx', 'approval'],
  properties: {
    routerFeePercentage: DecimalSchema,
    amountOut: IntegerStringSchema,
    minAmountOut: IntegerStringSchema,
    gas: IntegerStringSchema,
    tx: {
      type: 'object',
      properties: { data: { type: 'string' }, to: AddressSchema, from: AddressSchema, value: DecimalSchema },
    },
    approval: { type: ['object', 'null'], properties: { to: AddressSchema, data: { type: 'string' } } },
  },
} as const

export const ClmmMigrationOpts = {
  schema: { querystring: clmmMigrationQuerySchema, response: { 200: clmmMigrationResponseSchema } },
} as const
