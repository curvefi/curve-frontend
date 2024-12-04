import Box from '@mui/material/Box'
import { LllamalendSubHeader } from '@/components/PageLlamaMarkets/LllamalendSubHeader'
import { MarketsTable } from '@/components/PageLlamaMarkets/MarketsTable'
import { LlamalendSubFooter } from '@/components/PageLlamaMarkets/LlamalendSubFooter'

export const PageLlamaMarkets = () => {
  return (
    <Box>
      <LllamalendSubHeader />
      <MarketsTable></MarketsTable>
      <LlamalendSubFooter />
    </Box>
  )
}
