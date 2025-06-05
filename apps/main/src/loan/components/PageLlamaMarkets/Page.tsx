'use client'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { LendingMarketsTable } from '@/loan/components/PageLlamaMarkets/LendingMarketsTable'
import { LendTableFooter } from '@/loan/components/PageLlamaMarkets/LendTableFooter'
import { setAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import {
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
  setLendingVaults,
} from '@/loan/entities/lending-vaults'
import { invalidateAllUserLendingSupplies } from '@/loan/entities/lending-vaults'
import { useLlamaMarkets } from '@/loan/entities/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets, setMintMarkets } from '@/loan/entities/mint-markets'
import useStore from '@/loan/store/useStore'
import type { LlamaApi } from '@/loan/types/loan.types'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { isSuccess, useConnection } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { logSuccess } from '@ui-kit/lib'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Address } from '@ui-kit/utils'
import { useHeaderHeight } from '@ui-kit/widgets/Header'

/**
 * Reloads the lending vaults and mint markets.
 * Note: It does not reload the snapshots (for now).
 */
const onReload = (userAddress?: Address) => {
  invalidateLendingVaults({})
  invalidateMintMarkets({})
  invalidateAllUserLendingVaults(userAddress)
  invalidateAllUserLendingSupplies(userAddress)
  invalidateAllUserMintMarkets(userAddress)
}

const {
  Spacing,
  MaxWidth,
  Height: { modal: ModalHeight },
} = SizesAndSpaces

function useInjectServerData(props: CrvUsdServerData) {
  useEffect(() => {
    const { lendingVaults, mintMarkets, dailyVolume } = props
    lendingVaults && setLendingVaults({}, lendingVaults)
    mintMarkets && setMintMarkets({}, mintMarkets)
    dailyVolume != null && setAppStatsDailyVolume({}, dailyVolume)

    logSuccess('useInjectServerData', {
      lendingVaults: lendingVaults?.length,
      mintMarkets: mintMarkets?.length,
      dailyVolume,
    })
  }, [props])
}

/**
 * Page for displaying the lending markets table.
 */
export const LlamaMarketsPage = (props: CrvUsdServerData) => {
  useInjectServerData(props)
  const { address } = useAccount()
  const { connectState } = useConnection<LlamaApi>()
  const { data, isError, isLoading } = useLlamaMarkets(isSuccess(connectState) ? address : undefined)
  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0

  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const headerHeight = useHeaderHeight(bannerHeight)
  const showSkeleton = !data && (!isError || isLoading) // on initial render isLoading is still false
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl, marginInline: Spacing.md }}>
      {showSkeleton ? (
        <Skeleton variant="rectangular" width={MaxWidth.table} height={ModalHeight.md.height} />
      ) : (
        <LendingMarketsTable
          onReload={() => onReload(address)}
          result={data}
          headerHeight={headerHeight}
          isError={isError}
          minLiquidity={minLiquidity}
        />
      )}
      <LendTableFooter />
    </Box>
  )
}
