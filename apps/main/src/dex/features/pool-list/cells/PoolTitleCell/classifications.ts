import type { PoolRow } from '../../types'

type PoolType = NonNullable<PoolRow['poolType']>
export type PoolClassification = 'stable' | 'volatile' | 'fxswap'

export const poolTypeClassifications: Record<PoolType, PoolClassification> = {
  main: 'stable',
  factory: 'stable',
  crvusd: 'stable',
  stableswapng: 'stable',
  crypto: 'volatile',
  factory_crypto: 'volatile',
  factory_tricrypto: 'volatile',
  twocryptong: 'volatile',
  fxswap: 'fxswap',
}
