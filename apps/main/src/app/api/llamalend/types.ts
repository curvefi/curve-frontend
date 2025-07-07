import type { LendingVault } from '@/llamalend/entities/lending-vaults'
import type { MintMarket } from '@/llamalend/entities/mint-markets'

export type LlamalendServerData = {
  lendingVaults?: LendingVault[]
  mintMarkets?: MintMarket[]
}
