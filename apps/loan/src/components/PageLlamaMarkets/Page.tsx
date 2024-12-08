import Box from '@mui/material/Box'
import { LllamalendSubHeader } from '@/components/PageLlamaMarkets/LllamalendSubHeader'
import { MarketsTable } from '@/components/PageLlamaMarkets/MarketsTable'
import { LlamalendSubFooter } from '@/components/PageLlamaMarkets/LlamalendSubFooter'
import { invalidateAllPoolsQuery, useAllPoolsQuery } from '@/entities/pools'

const onReload = () => invalidateAllPoolsQuery({})

export const PageLlamaMarkets = () => {
  const { data, error, isLoading } = useAllPoolsQuery({})
  return (
    <Box>
      <LllamalendSubHeader />
      {data && <MarketsTable onReload={onReload} data={data} />}
      <LlamalendSubFooter />
    </Box>
  )
}
