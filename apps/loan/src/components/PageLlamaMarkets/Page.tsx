import Box from '@mui/material/Box'
import { LllamalendSubHeader } from '@/components/PageLlamaMarkets/LllamalendSubHeader'
import { MarketsTable } from '@/components/PageLlamaMarkets/MarketsTable'
import { LlamalendSubFooter } from '@/components/PageLlamaMarkets/LlamalendSubFooter'
import { invalidateLendingVaults, useLendingVaults } from '@/entities/vaults'
import DocumentHead from '@/layout/DocumentHead'
import { t } from '@lingui/macro'
import React from 'react'

const onReload = () => invalidateLendingVaults({})

export const PageLlamaMarkets = () => {
  const { data, error, isFetching } = useLendingVaults({}) // todo: show errors and loading state
  return (
    <Box>
      <DocumentHead title={t`Llamalend Markets`} />
      <LllamalendSubHeader />
      {!isFetching && data && <MarketsTable onReload={onReload} data={data.lendingVaultData} />}
      <LlamalendSubFooter />
    </Box>
  )
}
