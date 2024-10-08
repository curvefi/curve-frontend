import { tokenKeys } from '../model'
import { queryClient } from '@/shared/api/query-client'
import { TokenKey } from '@/entities/token'

export const getTokenQueryData = <Result, Key extends TokenKey = TokenKey>(key: TokenKey, keyData: Parameters<typeof tokenKeys[Key]>[0]) =>
  queryClient.getQueryData<Result>(tokenKeys[key](keyData))
