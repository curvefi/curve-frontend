import Box from '@mui/material/Box'
import { LllamalendSubHeader } from '@/components/PageLlamaMarkets/LllamalendSubHeader'
import { MarketsTable } from '@/components/PageLlamaMarkets/MarketsTable'
import { LlamalendSubFooter } from '@/components/PageLlamaMarkets/LlamalendSubFooter'
import { invalidatePoolsQuery, usePoolsQuery } from '@/entities/pools'

const onReload = () => invalidatePoolsQuery({})

export const PageLlamaMarkets = () => {
  const { data, error, isLoading } = usePoolsQuery({})
  return (
    <Box>
      <LllamalendSubHeader />
      {data && <MarketsTable onReload={onReload} data={data} />}
      <LlamalendSubFooter />
    </Box>
  )
}
