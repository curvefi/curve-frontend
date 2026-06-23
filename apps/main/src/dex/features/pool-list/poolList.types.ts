import type { NetworkConfig } from '@/dex/types/main.types'
import type { V2Pool } from '@curvefi/prices-api/pools'

export type PoolListItem = V2Pool & {
  baseDailyApy: number | null
  baseWeeklyApy: number | null
  hasPosition: boolean | undefined
  hasVyperVulnerability: boolean
  network: NetworkConfig['id']
  url: string
}
