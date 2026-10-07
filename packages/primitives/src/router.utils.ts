import type { Address, Hex } from './address.utils'
import type { Decimal } from './decimal.utils'

export const RouteProviders = ['curve', 'curve-solver', 'enso', '0x'] as const
export type RouteProvider = (typeof RouteProviders)[number]

/** External route providers are subject to router fees. */
export const ExternalRouteProviders = ['enso', '0x'] as const satisfies readonly RouteProvider[]
export type ExternalRouteProvider = (typeof ExternalRouteProviders)[number]

export type RouteStep = {
  name: string
  tokenIn: [Address]
  tokenOut: [Address]
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  protocol: 'curve' | string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  action: 'swap' | string
  args?: Record<string, unknown>
  chainId: number
}

export type TransactionData = { data: Hex; to: Address; from: Address; value: Decimal }

export type RouterRouteResponse = {
  router: RouteProvider
  routerFeePercentage: Decimal
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

/** Concentrated-liquidity position protocols the migration bundle can redeem. */
export const ClmmProtocols = ['uniswap-v3'] as const
export type ClmmProtocol = (typeof ClmmProtocols)[number]

/** Amounts are raw token units; `approval` is the NFT approval to send first, when one is missing. */
export type ClmmMigrationResponse = {
  routerFeePercentage: Decimal
  amountOut: Decimal
  minAmountOut: Decimal
  gas: Decimal
  tx: TransactionData
  approval: { to: Address; data: Hex } | null
}
