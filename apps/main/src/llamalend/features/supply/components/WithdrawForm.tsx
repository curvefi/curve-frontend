import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'

export const WithdrawForm = <ChainId extends IChainId>(_props: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}) => <Stack>Withdraw</Stack>
