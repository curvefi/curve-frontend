import { Address } from 'viem'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'

export type Decimal = `${number}`

export const ADDRESS_HEX_PATTERN = '^0x[a-fA-F0-9]{40}$'
export const DECIMAL_PATTERN = '^-?\\d+(\\.\\d+)?$'

export const OptimalRoutePath = '/api/router/optimal-route'

const AddressSchema = { type: 'string', pattern: ADDRESS_HEX_PATTERN } as const
const AddressArraySchema = { type: 'array', items: AddressSchema, minItems: 1, maxItems: 1 } as const
const DecimalSchema = { type: 'string', pattern: DECIMAL_PATTERN }
const AmountArraySchema = { type: 'array', items: DecimalSchema, minItems: 1, maxItems: 1 } as const

const optimalRouteQuerySchema = {
  type: 'object',
  required: ['tokenIn', 'tokenOut'],
  additionalProperties: false,
  properties: {
    chainId: { type: 'integer', minimum: 1, default: 1 },
    tokenIn: AddressArraySchema,
    tokenOut: AddressArraySchema,
    amountIn: AmountArraySchema,
    amountOut: AmountArraySchema,
  },
} as const

export type OptimalRouteQuery = {
  chainId: number
  tokenIn: [Address]
  tokenOut: [Address]
  amountIn?: [Decimal]
  amountOut?: [Decimal]
}

const routeItemSchema = {
  type: 'object',
  required: ['amountOut', 'priceImpact', 'createdAt', 'route'],
  properties: {
    amountIn: DecimalSchema,
    amountOut: DecimalSchema,
    priceImpact: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    createdAt: { type: 'integer' },
    isStableswapRoute: { type: 'boolean' },
    route: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tokenIn', 'tokenOut', 'protocol', 'action', 'args', 'chainId'],
        properties: {
          tokenIn: { type: 'array', items: AddressSchema },
          tokenOut: { type: 'array', items: AddressSchema },
          protocol: { type: 'string', enum: ['curve'] },
          action: { type: 'string', enum: ['swap'] },
          args: {
            type: 'object',
            required: ['swapAddress', 'swapParams', 'tvl'],
            additionalProperties: true,
            properties: {
              poolId: { type: 'string' },
              swapAddress: AddressSchema,
              swapParams: {
                description: 'Array of [inputCoinIndex, outputCoinIndex, swapType, amount, minAmountOut]',
                type: 'array',
                items: { type: 'integer' },
                minItems: 5,
                maxItems: 5,
              },
              poolAddress: AddressSchema,
              basePool: AddressSchema,
              baseToken: AddressSchema,
              secondBasePool: AddressSchema,
              secondBaseToken: AddressSchema,
              tvl: { type: 'number' },
            },
            chainId: { type: 'integer' },
          },
        },
      },
    },
  },
} as const

const OptimalRouteSchema = {
  querystring: optimalRouteQuerySchema,
  response: { 200: { type: 'array', items: routeItemSchema } },
}

export const OptimalRouteOpts = { schema: OptimalRouteSchema } as const

type RouteArgs = Omit<IRouteStep, 'inputCoinAddress' | 'outputCoinAddress' | 'poolId'> & { poolId?: string }

export type RouteStep = {
  name: string
  tokenIn: [Address]
  tokenOut: [Address]
  protocol: 'curve'
  action: 'swap'
  args: RouteArgs
  chainId: number
}

export type RouteResponse = {
  amountIn: Decimal
  amountOut: Decimal
  priceImpact: number | null
  createdAt: number
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  isStableswapRoute: boolean
  route: RouteStep[]
}
