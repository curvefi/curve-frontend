import { useCallback, useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { invalidateBadDebtMarkets } from '@/llamalend/queries/market'
import type { Address } from '@primitives/address.utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { q } from '@ui-kit/types/util'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import {
  invalidateUserLendingSupplies,
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
} from '../../queries/market-list/lending-vaults'
import { useLlamaMarkets } from '../../queries/market-list/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets } from '../../queries/market-list/mint-markets'
import { LendTableFooter } from './LendTableFooter'
import { LlamaMarketsTable } from './LlamaMarketsTable'
import { UserPositionsTables } from './UserPositionsTables'

/**
 * Creates a callback to reload the markets and user data.
 * Returns a tuple with:
 * - `isReloading`: boolean indicating if the reload is in progress.
 *                  without this, react-query will show the stale data so the user doesn't notice the reload.
 * - `onReload`: function to trigger the reload.
 * Note: It does not reload the snapshots (for now).
 */
const useOnReload = ({ address: userAddress, isFetching }: { address?: Address; isFetching: boolean }) => {
  const [isReloading, setIsReloading] = useState(false)
  const onReload = useCallback(() => {
    if (isReloading) return
    setIsReloading(true)

    void Promise.all([
      invalidateLendingVaults({}),
      invalidateMintMarkets({}),
      invalidateBadDebtMarkets(),
      invalidateAllUserLendingVaults(userAddress),
      invalidateUserLendingSupplies({ userAddress }),
      invalidateAllUserMintMarkets(userAddress),
    ])
  }, [isReloading, userAddress])

  useEffect(() => {
    // reset the isReloading state when the data is fetched
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    if (isReloading && !isFetching) setIsReloading(false)
  }, [isFetching, isReloading])

  return [isReloading && isFetching, onReload] as const
}

/** Fetches Llama markets and normalizes loading so initial load and manual reload show a loading state. */
const useTableLlamaMarkets = (address: Address | undefined) => {
  const enableDeprecatedMarkets = useUserProfileStore(state => state.showDeprecatedMarkets)
  const query = useLlamaMarkets({
    userAddress: address,
    enableLLv2: useLLv2(),
    enableDeprecatedMarkets,
  })
  const { data, isError, isLoading, isFetching } = query
  const [isReloading, onReload] = useOnReload({ address, isFetching })
  const loading = isReloading || (!data && (!isError || isLoading)) // on initial render isLoading is still false

  return {
    onReload,
    tableQuery: q({ ...query, isLoading: loading }),
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
