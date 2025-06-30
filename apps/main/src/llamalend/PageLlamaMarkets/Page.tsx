'use client'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import type { LlamalendServerData } from '@/app/api/llamalend/types'
import {
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
  setLendingVaults,
} from '@/llamalend/entities/lending-vaults'
import { invalidateAllUserLendingSupplies } from '@/llamalend/entities/lending-vaults'
import { useLlamaMarkets } from '@/llamalend/entities/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets, setMintMarkets } from '@/llamalend/entities/mint-markets'
import { LendTableFooter } from '@/llamalend/PageLlamaMarkets/LendTableFooter'
import { LlamaMarketsTable } from '@/llamalend/PageLlamaMarkets/LlamaMarketsTable'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
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

function useInjectServerData(props: LlamalendServerData) {
  useEffect(() => {
    const { lendingVaults, mintMarkets, dailyVolume } = props
    lendingVaults && setLendingVaults({}, lendingVaults)
    mintMarkets && setMintMarkets({}, mintMarkets)

    logSuccess('useInjectServerData', {
      lendingVaults: lendingVaults?.length,
      mintMarkets: mintMarkets?.length,
    })
  }, [props])
}

/**
 * Page for displaying the lending markets table.
 */
export const LlamaMarketsPage = (props: LlamalendServerData) => {
  useInjectServerData(props)
  const { address } = useAccount()
  const { data, isError, isLoading } = useLlamaMarkets(address)
  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0

  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)
  const headerHeight = useHeaderHeight(bannerHeight)
  const showSkeleton = !data && (!isError || isLoading) // on initial render isLoading is still false
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl, ...(!useIsTiny() && { marginInline: Spacing.md }) }}>
      {showSkeleton ? (
        <Skeleton variant="rectangular" width={MaxWidth.table} height={ModalHeight.md.height} />
      ) : (
        <LlamaMarketsTable
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
