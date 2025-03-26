import type { LendingVault } from '@/loan/entities/lending-vaults'
import type { MintMarket } from '@/loan/entities/mint-markets'
import type { Chain } from '@curvefi/prices-api'

export type CrvUsdServerData = {
  lendingVaults?: LendingVault[]
  mintMarkets?: MintMarket[]
  supportedChains?: Chain[]
  supportedLendingChains?: Chain[]
  dailyVolume?: number
}
