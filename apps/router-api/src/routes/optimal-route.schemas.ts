import { Address } from 'viem'
import type { IRouteStep, ISwapType } from '@curvefi/api/lib/interfaces'

export type Decimal = `${number}`

const AddressSchema = { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' } as const
const AddressArraySchema = { type: 'array', items: AddressSchema, minItems: 1, maxItems: 1 } as const
const AmountArraySchema = { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 1 } as const

export const optimalRouteQuerySchema = {
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
  amountIn: [Decimal] | undefined
  amountOut: [Decimal] | undefined
}

export const routeItemSchema = {
  type: 'object',
  required: ['gas', 'amountOut', 'priceImpact', 'feeAmount', 'minAmountOut', 'createdAt', 'tx', 'route'],
  properties: {
    amountOut: { type: 'string' },
    priceImpact: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    createdAt: { type: 'integer' },
    route: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tokenIn', 'tokenOut', 'protocol', 'action', 'args', 'chainId'],
        properties: {
          tokenIn: { type: 'array', items: { type: 'string' } },
          tokenOut: { type: 'array', items: { type: 'string' } },
          protocol: { type: 'string', enum: ['curve'] },
          action: { type: 'string', enum: ['swap'] },
          args: {
            type: 'object',
            required: ['poolId', 'amount'],
            additionalProperties: true,
            properties: {
              poolId: { type: 'string' },
              amount: { type: 'string' },
              swapAddress: AddressSchema,
              inputCoinAddress: AddressSchema,
              outputCoinAddress: AddressSchema,
              swapParams: {
                description: 'Array of [inputCoinIndex, outputCoinIndex, swapType, amount, minAmountOut]',
                type: 'array',
                items: [
                  { type: 'integer', description: 'inputCoinIndex' },
                  { type: 'integer', description: 'outputCoinIndex' },
                  {
                    type: 'string',
                    enum: Array.from({ length: 9 }, (_, i) => i + 1) as ISwapType[],
                    description: 'swapType',
                  },
                  { type: 'integer', description: 'amount' },
                  { type: 'integer', description: 'minAmountOut' },
                ],
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

type RouteStep = {
  tokenIn: [Address]
  tokenOut: [Address]
  protocol: 'curve'
  action: 'swap'
  args: Omit<IRouteStep, 'inputCoinAddress' | 'outputCoinAddress'>
  chainId: number
}

export type RouteResponse = {
  amountOut: string
  priceImpact: number | null
  createdAt: number
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route: RouteStep[]
}
