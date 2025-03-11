'use client'
import { LendingMarketsTable } from '@/loan/components/PageLlamaMarkets/LendingMarketsTable'
import { LendTableFooter } from '@/loan/components/PageLlamaMarkets/LendTableFooter'
import { invalidateAllUserLendingVaults, invalidateLendingVaults } from '@/loan/entities/lending-vaults'
import { useLlamaMarkets } from '@/loan/entities/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets } from '@/loan/entities/mint-markets'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import useStore from '@/loan/store/useStore'
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

/**
 * Page for displaying the lending markets table.
 */
export const PageLlamaMarkets = () => {
  const { signerAddress } = useWallet()
  const { data, isError, isLoading } = useLlamaMarkets(signerAddress)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const headerHeight = useHeaderHeight(bannerHeight)
  usePageOnMount() // required for connecting wallet
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl }}>
      {!data && (!isError || isLoading) ? (
        <Skeleton variant="rectangular" width={MaxWidth.table} height={ModalHeight.md.height} />
      ) : (
        <LendingMarketsTable
          onReload={() => onReload(signerAddress)}
          data={data ?? []}
          headerHeight={headerHeight}
          isError={isError}
        />
      )}
      <LendTableFooter />
    </Box>
  )
}
