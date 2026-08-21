import { useCallback } from 'react'
import { resetBadDebtMarkets } from '@/llamalend/queries/market'
import {
  resetLendingVaults,
  resetAllUserLendingVaults,
  resetUserLendingSupplies,
} from '@/llamalend/queries/market-list/lending-vaults'
import { useLlamaMarketRows, type LlamaMarketsTableResult } from '@/llamalend/queries/market-list/llama-market-stats'
import { useLlamaMarkets, type LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { resetMintMarkets, resetAllUserMintMarkets } from '@/llamalend/queries/market-list/mint-markets'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useMappedQuery } from '@evm-ui/types/util'
import type { Address } from '@primitives/address.utils'

const EMPTY_MARKETS: LlamaMarketsResult['markets'] = []

/** Fetches markets and normalizes loading so initial load and manual reload show a loading state. */
export const useMarketsTable = (address: Address | undefined) => {
  const marketsQuery = useLlamaMarkets({
    userAddress: address,
    enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
  })
  const marketRows = useLlamaMarketRows(marketsQuery.data?.markets ?? EMPTY_MARKETS, address)
  const tableQuery = useMappedQuery(
    marketsQuery,
    useCallback(
      (data: LlamaMarketsResult): LlamaMarketsTableResult => ({
        ...data,
        markets: marketRows,
      }),
      [marketRows],
    ),
  )

  return {
    tableQuery,
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
  }
}
