import { queryClient } from '@/shared/api/query-client'
import { tokenKeys } from '@/entities/token'

export const getLastTokenUsdRate = (chainId: ChainId, tokenAddress: string) => queryClient.getQueryData<number>(tokenKeys.usdRate({
  chainId,
  tokenAddress
}))
