import { useCallback, useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { invalidateBadDebtMarkets } from '@/llamalend/queries/market'
import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useLLv2, useNewMarketListLayout } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import {
  invalidateAllUserLendingSupplies,
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
} from '../../queries/market-list/lending-vaults'
import { useLlamaMarkets } from '../../queries/market-list/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets } from '../../queries/market-list/mint-markets'
import { LegacyLlamaMarketsTable } from './LegacyLlamaMarketsTable'
import { LegacyUserPositionsTable } from './LegacyUserPositionsTable'
import { LendTableFooter } from './LendTableFooter'
import { LlamaMarketsTable } from './LlamaMarketsTable'
import { UserPositionsTables } from './UserPositionsTables'

const { Spacing } = SizesAndSpaces

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
      invalidateAllUserLendingSupplies(userAddress),
      invalidateAllUserMintMarkets(userAddress),
    ])
  }, [isReloading, userAddress])

  useEffect(() => {
    // reset the isReloading state when the data is fetched
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
  const { connect } = useWallet()
  const { address, isConnecting } = useConnection()

  const {
    tableQuery: { data, isLoading, error },
    tableQuery,
    onReload,
  } = useTableLlamaMarkets(address)

  const isNewLayout = useNewMarketListLayout()

  return (
    <ListPageWrapper footer={<LendTableFooter />}>
      {address ? (
        data?.userHasPositions &&
        (isNewLayout ? (
          <UserPositionsTables onReload={onReload} tableQuery={tableQuery} />
        ) : (
          <LegacyUserPositionsTable onReload={onReload} tableQuery={tableQuery} />
        ))
      ) : (
        <Box sx={{ paddingBlock: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}>
          <EmptyStateCard
            action={
              <ConnectWalletButton
                label={t`Connect to view positions`}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
                onClick={() => connect()}
                loading={isConnecting}
              />
            }
          />
        </Box>
      )}
      {isNewLayout ? (
        <LlamaMarketsTable onReload={onReload} tableQuery={tableQuery} />
      ) : (
        <LegacyLlamaMarketsTable onReload={onReload} result={data} isError={!!error} loading={isLoading} />
      )}
    </ListPageWrapper>
  )
}
