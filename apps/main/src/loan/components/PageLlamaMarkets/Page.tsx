'use client'
import { useEffect } from 'react'
import { LendingMarketsTable } from '@/loan/components/PageLlamaMarkets/LendingMarketsTable'
import { LendTableFooter } from '@/loan/components/PageLlamaMarkets/LendTableFooter'
import { setAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { setSupportedChains, setSupportedLendingChains } from '@/loan/entities/chains'
import {
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
  type LendingVault,
} from '@/loan/entities/lending-vaults'
import { setLendingVaults } from '@/loan/entities/lending-vaults'
import { useLlamaMarkets } from '@/loan/entities/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets, type MintMarket } from '@/loan/entities/mint-markets'
import { setMintMarkets } from '@/loan/entities/mint-markets'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import useStore from '@/loan/store/useStore'
import type { Chain } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useWallet } from '@ui-kit/features/connect-wallet'
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

export type LlamaMarketsPageProps = {
  lendingVaults?: LendingVault[]
  mintMarkets?: MintMarket[]
  supportedChains?: Chain[]
  supportedLendingChains?: Chain[]
  dailyVolume?: number
}

function useInjectServerData(props: LlamaMarketsPageProps) {
  useEffect(() => {
    const { lendingVaults, mintMarkets, supportedChains, supportedLendingChains, dailyVolume } = props
    lendingVaults && setLendingVaults({}, lendingVaults)
    mintMarkets && setMintMarkets({}, mintMarkets)
    supportedChains && setSupportedChains({}, supportedChains)
    supportedLendingChains && setSupportedLendingChains({}, supportedLendingChains)
    dailyVolume != null && setAppStatsDailyVolume({}, dailyVolume)
  }, [props])
}

/**
 * Page for displaying the lending markets table.
 */
export const LlamaMarketsPage = (props: LlamaMarketsPageProps) => {
  useInjectServerData(props)
  const { signerAddress } = useWallet()
  const { data, isError, isLoading } = useLlamaMarkets(signerAddress)
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
        />
      )}
      <LendTableFooter />
    </Box>
  )
}
