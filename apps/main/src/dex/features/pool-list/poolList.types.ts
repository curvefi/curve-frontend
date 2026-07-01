import type { NetworkConfig } from '@/dex/types/main.types'
import type { V2Pool } from '@curvefi/prices-api/pools'

export type PoolListItem = V2Pool & {
  hasPosition: boolean | undefined
  hasVyperVulnerability: boolean | undefined
  network: NetworkConfig['id']
  url: string
}
