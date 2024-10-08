import { queryClient } from '@/shared/api/query-client'
import { ChainKey, chainKeys } from '@/entities/chain/model'

export const getChainQueryData = <Result, Key extends ChainKey = ChainKey>(key: ChainKey, keyData: Parameters<typeof chainKeys[Key]>[0]) =>
  queryClient.getQueryData<Result>(chainKeys[key](keyData))
