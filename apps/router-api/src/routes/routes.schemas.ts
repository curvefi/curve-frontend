import { RouteProviders } from '../../../../packages/primitives/src/router'
import type {
  Address,
  Decimal,
  RouteProvider,
  RouteResponse,
  RouteStep,
  TransactionData,
} from '@curvefi/primitives/router'

export const ADDRESS_HEX_PATTERN = '^0x[a-fA-F0-9]{40}$'
export const DECIMAL_PATTERN = '^-?\\d+(\\.\\d+)?$'
export const WEI_AMOUNT_PATTERN = '^\\d+$'

export const RoutesPath = '/api/router/v1/routes'

const AddressSchema = { type: 'string', pattern: ADDRESS_HEX_PATTERN } as const
const AddressArraySchema = { type: 'array', items: AddressSchema, minItems: 1, maxItems: 1 } as const
const DecimalSchema = { type: 'string', pattern: DECIMAL_PATTERN }
const WeiAmountSchema = { type: 'string', pattern: WEI_AMOUNT_PATTERN } as const
const WeiAmountArraySchema = { type: 'array', items: WeiAmountSchema, minItems: 1, maxItems: 1 } as const

const routesQuerySchema = {
  type: 'object',
  required: ['tokenIn', 'tokenOut'],
  additionalProperties: false,
  properties: {
    chainId: { type: 'integer', minimum: 1, default: 1 },
    router: {
      type: 'array',
      items: { type: 'string', enum: RouteProviders },
      minItems: 1,
      maxItems: RouteProviders.length,
      uniqueItems: true,
    },
    tokenIn: AddressArraySchema,
    tokenOut: AddressArraySchema,
    amountIn: { ...WeiAmountArraySchema, description: 'Amount of tokenIn in wei (integer, no decimals).' },
    amountOut: { ...WeiAmountArraySchema, description: 'Amount of tokenOut in wei (integer, no decimals).' },
    userAddress: AddressSchema,
    slippage: { type: 'number', minimum: 0 },
  },
} as const

export type RoutesQuery = {
  chainId: number
  router?: RouteProvider[]
  tokenIn: [Address]
  tokenOut: [Address]
  amountIn?: [Decimal]
  amountOut?: [Decimal]
  userAddress?: Address
  slippage?: number
}

const routeItemSchema = {
  type: 'object',
  required: ['id', 'router', 'amountOut', 'priceImpact', 'createdAt', 'route'],
  properties: {
    id: { type: 'string', minLength: 1 },
    router: { type: 'string', enum: RouteProviders },
    amountIn: WeiAmountArraySchema,
    amountOut: WeiAmountArraySchema,
    priceImpact: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    createdAt: { type: 'integer' },
    isStableswapRoute: { type: 'boolean' },
    warnings: {
      type: 'array',
      items: { type: 'string', enum: ['high-slippage', 'low-exchange-rate'] },
    },
    tx: {
      type: 'object',
      properties: {
        data: { type: 'string' },
        to: AddressSchema,
        from: AddressSchema,
        value: DecimalSchema,
      },
    },
    route: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tokenIn', 'tokenOut', 'protocol', 'action', 'chainId'],
        properties: {
          tokenIn: { type: 'array', items: AddressSchema },
          tokenOut: { type: 'array', items: AddressSchema },
          protocol: { type: 'string' },
          action: { type: 'string' },
          args: {
            type: 'object',
            additionalProperties: true,
          },
          chainId: { type: 'integer' },
        },
      },
    },
  },
} as const

const RoutesSchema = {
  querystring: routesQuerySchema,
  response: { 200: { type: 'array', items: routeItemSchema } },
}

export const RoutesOpts = { schema: RoutesSchema } as const
