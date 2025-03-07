'use client'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { LendingMarketsTable } from '@/loan/components/PageLlamaMarkets/LendingMarketsTable'
import { LendTableFooter } from '@/loan/components/PageLlamaMarkets/LendTableFooter'
import { invalidateLendingVaults } from '@/loan/entities/lending-vaults'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import useStore from '@/loan/store/useStore'
import { useLlamaMarkets } from '@/loan/entities/llama-markets'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import { invalidateMintMarkets } from '@/loan/entities/mint-markets'

/**
 * Reloads the lending vaults and mint markets.
 * Note: It does not reload the snapshots (for now).
 */
const onReload = () => {
  invalidateLendingVaults({})
  invalidateMintMarkets({})
}

const { Spacing, MaxWidth, ModalHeight } = SizesAndSpaces

/**
 * Page for displaying the lending markets table.
 */
export const PageLlamaMarkets = () => {
  const { data, isLoading, isError } = useLlamaMarkets() // todo: show errors and loading state
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const headerHeight = useHeaderHeight(bannerHeight)
  usePageOnMount() // required for connecting wallet
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl }}>
      {isLoading ? (
        <Skeleton variant="rectangular" width={MaxWidth.table} height={ModalHeight.md.height} />
      ) : (
        <LendingMarketsTable onReload={onReload} data={data ?? []} headerHeight={headerHeight} isError={isError} />
      )}
      <LendTableFooter />
    </Box>
  )
}
