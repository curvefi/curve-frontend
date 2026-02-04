import type { Decimal } from '../../utils/decimal'

export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]

export type RouteOption = {
  provider: RouteProvider
  toAmountOutput: Decimal
}
