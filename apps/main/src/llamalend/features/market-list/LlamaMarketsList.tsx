import { useCallback, useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import type { Address } from '@primitives/address.utils'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import {
  invalidateAllUserLendingSupplies,
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
} from '../../queries/market-list/lending-vaults'
import { useLlamaMarkets } from '../../queries/market-list/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets } from '../../queries/market-list/mint-markets'
import { LendTableFooter } from './LendTableFooter'
import { LlamaMarketsTable } from './LlamaMarketsTable'
import { UserPositionsTabs } from './UserPositionTabs'

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
      invalidateAllUserLendingVaults(userAddress),
      invalidateAllUserLendingSupplies(userAddress),
      invalidateAllUserMintMarkets(userAddress),
    ])
  }, [isReloading, userAddress])

  useEffect(() => {
    // reset the isReloading state when the data is fetched
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isReloading && !isFetching) setIsReloading(false)
  }, [isFetching, isReloading])

  return [isReloading && isFetching, onReload] as const
}

/**
 * Page for displaying the lending markets table.
 */
export const LlamaMarketsList = () => {
  const { address } = useConnection()
  const { data, isError, isLoading, isFetching } = useLlamaMarkets(address)
  const [isReloading, onReload] = useOnReload({ address, isFetching })
  const loading = isReloading || (!data && (!isError || isLoading)) // on initial render isLoading is still false
  return (
    <ListPageWrapper footer={<LendTableFooter />}>
      {(data?.userHasPositions || !address) && (
        <UserPositionsTabs onReload={onReload} result={data} isError={isError} loading={loading} />
      )}
      <LlamaMarketsTable onReload={onReload} result={data} isError={isError} loading={loading} />
    </ListPageWrapper>
  )
}
