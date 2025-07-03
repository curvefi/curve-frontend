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
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { logSuccess } from '@ui-kit/lib'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Address } from '@ui-kit/utils'

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

const { Spacing, MaxWidth, MinHeight } = SizesAndSpaces

function useInjectServerData(props: LlamalendServerData) {
  useEffect(() => {
    const { lendingVaults, mintMarkets } = props
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

  const showSkeleton = !data && (!isError || isLoading) // on initial render isLoading is still false
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl, ...(!useIsTiny() && { marginInline: Spacing.md }) }}>
      <WithSkeleton loading={showSkeleton} variant="rectangular" sx={{ maxWidth: 'none' }}>
        <Stack
          sx={{
            marginBlockStart: Spacing.xl,
            marginBlockEnd: Spacing.xxl,
            maxWidth: MaxWidth.table,
            minHeight: MinHeight.pageContent,
          }}
        >
          <LlamaMarketsTable
            onReload={() => onReload(address)}
            result={data}
            isError={isError}
            minLiquidity={minLiquidity}
          />
        </Stack>
      </WithSkeleton>

      <LendTableFooter />
    </Box>
  )
}
