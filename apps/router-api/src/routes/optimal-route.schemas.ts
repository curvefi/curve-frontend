export { type RouteProvider } from 'curve-ui-kit/src/widgets/RouteProvider/route-provider.types'
import { type RouteProvider, RouteProviders } from 'curve-ui-kit/src/widgets/RouteProvider/route-provider.types'
import { Address, Hex } from 'viem'
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
    router: {
      type: 'array',
      items: { type: 'string', enum: RouteProviders },
      minItems: 1,
      maxItems: RouteProviders.length,
      uniqueItems: true,
    },
    tokenIn: AddressArraySchema,
    tokenOut: AddressArraySchema,
    amountIn: AmountArraySchema,
    amountOut: AmountArraySchema,
    fromAddress: AddressSchema,
    slippage: { type: 'number', minimum: 0 },
  },
} as const

export type OptimalRouteQuery = {
  chainId: number
  router?: RouteProvider[]
  tokenIn: [Address]
  tokenOut: [Address]
  amountIn?: [Decimal]
  amountOut?: [Decimal]
  fromAddress?: Address
  slippage?: number
}

const routeItemSchema = {
  type: 'object',
  required: ['amountOut', 'priceImpact', 'createdAt', 'route'],
  properties: {
    router: { type: 'string', enum: RouteProviders },
    amountIn: DecimalSchema,
    amountOut: DecimalSchema,
    priceImpact: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    createdAt: { type: 'integer' },
    isStableswapRoute: { type: 'boolean' },
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

const OptimalRouteSchema = {
  querystring: optimalRouteQuerySchema,
  response: { 200: { type: 'array', items: routeItemSchema } },
}

export const OptimalRouteOpts = { schema: OptimalRouteSchema } as const

type CurveRouteArgs = Omit<IRouteStep, 'inputCoinAddress' | 'outputCoinAddress' | 'poolId'> & { poolId?: string }

export type RouteStep = {
  name: string
  tokenIn: [Address]
  tokenOut: [Address]
  protocol: 'curve' | string
  action: 'swap' | string
  args?: CurveRouteArgs | Record<string, unknown>
  chainId: number
}

export type TransactionData = { data: Hex; to: Address; from: Address; value: Decimal }

export type RouteResponse = {
  router: RouteProvider
  amountIn: [Decimal]
  amountOut: [Decimal]
  priceImpact: number | null
  createdAt: number
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route: RouteStep[]
  isStableswapRoute?: boolean
  tx?: TransactionData
}
