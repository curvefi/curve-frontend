import type { Address, Hex } from './address.utils'
import type { Decimal } from './decimal.utils'

export const RouteProviders = ['curve', 'curve-solver', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]

export type RouteStep = {
  name: string
  tokenIn: [Address]
  tokenOut: [Address]
  protocol: 'curve' | string
  action: 'swap' | string
  args?: Record<string, unknown>
  chainId: number
}

export type TransactionData = { data: Hex; to: Address; from: Address; value: Decimal }

export type RouterRouteResponse = {
  router: RouteProvider
  amountIn: [Decimal]
  amountOut: [Decimal]
  gas: Decimal | [Decimal, Decimal] | null
  priceImpact: number | null
  createdAt: number
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route?: RouteStep[]
  isStableswapRoute?: boolean
  tx?: TransactionData
}
