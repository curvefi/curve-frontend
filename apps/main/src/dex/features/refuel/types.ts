import type { Address } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'

type RefuelToken = {
  address: Address
  decimals: number
  symbol: string
}

export type RefuelTokens = {
  tokenA: RefuelToken
  tokenB: RefuelToken
}

export const REFUEL_CONFIGURATIONS = ['balanced', 'tokenA', 'tokenB', 'custom'] as const
export type RefuelConfiguration = (typeof REFUEL_CONFIGURATIONS)[number]

export const REFUEL_PRESET_PERCENTAGES = {
  balanced: '50',
  tokenA: '0',
  tokenB: '100',
} as const satisfies Record<Exclude<RefuelConfiguration, 'custom'>, Decimal>

export type RefuelFormValues = {
  configuration: RefuelConfiguration
  targetRefuelPercentage: Decimal | undefined
  tokenAAmount: Decimal | undefined
  tokenBAmount: Decimal | undefined
}
