'use client'
import { useEffect } from 'react'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { LendingMarketsTable } from '@/loan/components/PageLlamaMarkets/LendingMarketsTable'
import { LendTableFooter } from '@/loan/components/PageLlamaMarkets/LendTableFooter'
import { setAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { setSupportedChains, setSupportedLendingChains } from '@/loan/entities/chains'
import {
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
  setLendingVaults,
} from '@/loan/entities/lending-vaults'
import { useLlamaMarkets } from '@/loan/entities/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets, setMintMarkets } from '@/loan/entities/mint-markets'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import useStore from '@/loan/store/useStore'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useWallet } from '@ui-kit/features/connect-wallet'
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
  invalidateAllUserMintMarkets(userAddress)
}

const { Spacing, MaxWidth, ModalHeight } = SizesAndSpaces

function useInjectServerData(props: CrvUsdServerData) {
  useEffect(() => {
    const { lendingVaults, mintMarkets, supportedChains, supportedLendingChains, dailyVolume } = props
    lendingVaults && setLendingVaults({}, lendingVaults)
    mintMarkets && setMintMarkets({}, mintMarkets)
    supportedChains && setSupportedChains({}, supportedChains)
    supportedLendingChains && setSupportedLendingChains({}, supportedLendingChains)
    dailyVolume != null && setAppStatsDailyVolume({}, dailyVolume)

    logSuccess('useInjectServerData', {
      lendingVaults: lendingVaults?.length,
      mintMarkets: mintMarkets?.length,
      supportedChains: supportedChains?.length,
      supportedLendingChains: supportedLendingChains?.length,
      dailyVolume,
    })
  }, [props])
}

/**
 * Page for displaying the lending markets table.
 */
export const LlamaMarketsPage = (props: CrvUsdServerData) => {
  useInjectServerData(props)
  const { signerAddress } = useWallet()
  const { data, isError, isLoading } = useLlamaMarkets(signerAddress)
  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0

  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const headerHeight = useHeaderHeight(bannerHeight)
  usePageOnMount() // required for connecting wallet
  const showSkeleton = !data && (!isError || isLoading) // on initial render isLoading is still false
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl }}>
      {showSkeleton ? (
        <Skeleton variant="rectangular" width={MaxWidth.table} height={ModalHeight.md.height} />
      ) : (
        <LendingMarketsTable
          onReload={() => onReload(signerAddress)}
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
