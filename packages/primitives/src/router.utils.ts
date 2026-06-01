import type { Address, Hex } from './address.utils'
import type { Decimal } from './decimal.utils'

export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]

export interface RouteStep {
  name: string
  tokenIn: [Address]
  tokenOut: [Address]
  protocol: 'curve' | string
  action: 'swap' | string
  args?: Record<string, unknown>
  chainId: number
}

export interface TransactionData {
  data: Hex
  to: Address
  from: Address
  value: Decimal
}

export interface RouterRouteResponse {
  router: RouteProvider
  amountIn: [Decimal]
  amountOut: [Decimal]
  gas: Decimal | [Decimal, Decimal] | null
  priceImpact: number | null
  createdAt: number
  warnings: ('high-slippage' | 'low-exchange-rate')[]
  route: RouteStep[]
  isStableswapRoute?: boolean
  tx?: TransactionData
}
