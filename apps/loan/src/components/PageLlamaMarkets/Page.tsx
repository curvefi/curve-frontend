import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { LendTableTitle } from '@/components/PageLlamaMarkets/LendTableTitle'
import { MarketsTable } from '@/components/PageLlamaMarkets/MarketsTable'
import { LendTableFooter } from '@/components/PageLlamaMarkets/LendTableFooter'
import { invalidateLendingVaults, useLendingVaults } from '@/entities/vaults'
import DocumentHead from '@/layout/DocumentHead'
import { t } from '@lingui/macro'
import React from 'react'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const onReload = () => invalidateLendingVaults({})

const { Spacing, MaxWidth, ModalHeight } = SizesAndSpaces

export const PageLlamaMarkets = () => {
  const { data, error, isFetching } = useLendingVaults({}) // todo: show errors and loading state
  const isReady = data && !isFetching
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl }}>
      <DocumentHead title={t`Llamalend Markets`} />
      <LendTableTitle />
      {isReady ? <MarketsTable onReload={onReload} data={data.lendingVaultData} /> : <Skeleton variant="rectangular" width={MaxWidth.lg} height={ModalHeight.height} />}
      <LendTableFooter />
    </Box>
  )
}
