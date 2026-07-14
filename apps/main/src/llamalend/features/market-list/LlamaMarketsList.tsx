import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { resetBadDebtMarkets } from '@/llamalend/queries/market'
import type { Address } from '@primitives/address.utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { q } from '@ui-kit/types/util'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import {
  resetUserLendingSupplies,
  resetAllUserLendingVaults,
  resetLendingVaults,
} from '../../queries/market-list/lending-vaults'
import { useLlamaMarkets } from '../../queries/market-list/llama-markets'
import { resetAllUserMintMarkets, resetMintMarkets } from '../../queries/market-list/mint-markets'
import { LendTableFooter } from './LendTableFooter'
import { LlamaMarketsTable } from './LlamaMarketsTable'
import { UserPositionsTables } from './UserPositionsTables'

/** Fetches Llama markets and normalizes loading so initial load and manual reload show a loading state. */
const useTableLlamaMarkets = (address: Address | undefined) => {
  const enableDeprecatedMarkets = useUserProfileStore(state => state.showDeprecatedMarkets)
  const query = useLlamaMarkets({
    userAddress: address,
    enableDeprecatedMarkets,
  })

  const onReload = useCallback(() => {
    void Promise.all([
      resetLendingVaults({}),
      resetMintMarkets({}),
      resetBadDebtMarkets(),
      resetAllUserLendingVaults(address),
      resetUserLendingSupplies({ userAddress: address }),
      resetAllUserMintMarkets(address),
    ])
  }, [address])

  return {
    onReload,
    tableQuery: q({ ...query, isLoading: query.isPending }), // isPending so that the table shows a loading state on initial load and manual reload, but not on cache refetches
  }
}

/** Page for displaying the lending markets table. */
export const LlamaMarketsList = () => {
  const { address } = useConnection()

  const { tableQuery, onReload } = useTableLlamaMarkets(address)

  return (
    <ListPageWrapper footer={<LendTableFooter />}>
      <UserPositionsTables onReload={onReload} tableQuery={tableQuery} />
      <LlamaMarketsTable onReload={onReload} tableQuery={tableQuery} />
    </ListPageWrapper>
  )
}
