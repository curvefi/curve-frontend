import type { LendingVault } from '@/loan/entities/lending-vaults'
import type { MintMarket } from '@/loan/entities/mint-markets'

export type CrvUsdServerData = {
  lendingVaults?: LendingVault[]
  mintMarkets?: MintMarket[]
  dailyVolume?: number
}
