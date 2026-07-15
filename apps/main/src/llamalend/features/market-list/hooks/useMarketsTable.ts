import { useCallback } from 'react'
import { resetBadDebtMarkets } from '@/llamalend/queries/market'
import {
  resetLendingVaults,
  resetAllUserLendingVaults,
  resetUserLendingSupplies,
} from '@/llamalend/queries/market-list/lending-vaults'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import { resetMintMarkets, resetAllUserMintMarkets } from '@/llamalend/queries/market-list/mint-markets'
import type { Address } from '@primitives/address.utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

/** Fetches Llama markets and normalizes loading so initial load and manual reload show a loading state. */
export const useMarketsTable = (address: Address | undefined) => ({
  tableQuery: useLlamaMarkets({
    userAddress: address,
    enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
  }),
  onReload: useCallback(() => {
    void Promise.all([
      resetLendingVaults({}),
      resetMintMarkets({}),
      resetBadDebtMarkets(),
      resetAllUserLendingVaults(address),
      resetUserLendingSupplies({ userAddress: address }),
      resetAllUserMintMarkets(address),
    ])
  }, [address]),
})
