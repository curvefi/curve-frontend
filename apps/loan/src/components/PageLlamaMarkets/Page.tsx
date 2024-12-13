import Box from '@mui/material/Box'
import { LendTableTitle } from '@/components/PageLlamaMarkets/LendTableTitle'
import { MarketsTable } from '@/components/PageLlamaMarkets/MarketsTable'
import { LendTableFooter } from '@/components/PageLlamaMarkets/LendTableFooter'
import { invalidateLendingVaults, useLendingVaults } from '@/entities/vaults'
import DocumentHead from '@/layout/DocumentHead'
import { t } from '@lingui/macro'
import React from 'react'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const onReload = () => invalidateLendingVaults({})

const { Spacing } = SizesAndSpaces

export const PageLlamaMarkets = () => {
  const { data, error, isFetching } = useLendingVaults({}) // todo: show errors and loading state
  return (
    <Box sx={{ marginBlockEnd: Spacing.xxl }}>
      <DocumentHead title={t`Llamalend Markets`} />
      <LendTableTitle />
      {!isFetching && data && <MarketsTable onReload={onReload} data={data.lendingVaultData} />}
      <LendTableFooter />
    </Box>
  )
}
