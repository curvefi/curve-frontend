import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { LendTableTitle } from '@/loan/components/PageLlamaMarkets/LendTableTitle'
import { LendingMarketsTable } from '@/loan/components/PageLlamaMarkets/LendingMarketsTable'
import { LendTableFooter } from '@/loan/components/PageLlamaMarkets/LendTableFooter'
import { invalidateLendingVaults, useLendingVaults } from '@/loan/entities/vaults'
import DocumentHead from '@/loan/layout/DocumentHead'
import { t } from '@lingui/macro'
import React from 'react'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import useStore from '@/loan/store/useStore'

const onReload = () => invalidateLendingVaults({})

const { Spacing, MaxWidth, ModalHeight } = SizesAndSpaces

/**
 * Page for displaying the lending markets table.
 */
export const PageLlamaMarkets = () => {
  const { data, error, isFetching } = useLendingVaults({}) // todo: show errors and loading state
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const isReady = data && !isFetching
  const headerHeight = useHeaderHeight(bannerHeight)
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl }}>
      <DocumentHead title={t`Llamalend Markets`} />
      <LendTableTitle />
      {isReady ? (
        <LendingMarketsTable onReload={onReload} data={data.lendingVaultData} headerHeight={headerHeight} />
      ) : (
        <Skeleton variant="rectangular" width={MaxWidth.table} height={ModalHeight.md.height} />
      )}
      <LendTableFooter />
    </Box>
  )
}
