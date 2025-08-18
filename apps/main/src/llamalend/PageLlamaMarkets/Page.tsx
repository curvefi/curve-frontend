'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { logSuccess } from '@ui-kit/lib'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Address } from '@ui-kit/utils'

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

    invalidateLendingVaults({})
    invalidateMintMarkets({})
    invalidateAllUserLendingVaults(userAddress)
    invalidateAllUserLendingSupplies(userAddress)
    invalidateAllUserMintMarkets(userAddress)
  }, [isReloading, userAddress])

  useEffect(() => {
    // reset the isReloading state when the data is fetched
    if (isReloading && !isFetching) setIsReloading(false)
  }, [isFetching, isReloading])

  return [isReloading && isFetching, onReload] as const
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
  const { data, isError, isLoading, isFetching } = useLlamaMarkets(address)
  const [isReloading, onReload] = useOnReload({ address, isFetching })

  const loading = isReloading || (!data && (!isError || isLoading)) // on initial render isLoading is still false
  const forceLoading = useMemo(
    // todo: remove after testing
    () => typeof window !== 'undefined' && window.localStorage.getItem('llamalend-force-loading') !== null,
    [],
  )
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl, ...(!useIsTiny() && { marginInline: Spacing.md }) }}>
      <Stack
        sx={{
          marginBlockStart: Spacing.xl,
          marginBlockEnd: Spacing.xxl,
          maxWidth: MaxWidth.table,
          minHeight: MinHeight.pageContent,
        }}
      >
        <LlamaMarketsTable onReload={onReload} result={data} isError={isError} loading={loading || forceLoading} />
      </Stack>

      <LendTableFooter />
    </Box>
  )
}
