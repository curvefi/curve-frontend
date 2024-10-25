import { QueryFunction } from '@tanstack/react-query'
import { TokenQueryKeyType } from '@/entities/token'
import { assertTokenValidity } from '@/entities/token/lib/validation'
import { logQuery } from '@/shared/lib/logging'
import useStore from '@/store/useStore'

export const queryTokenUsdRate: QueryFunction<number, TokenQueryKeyType<'usdRate'>> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , tokenAddress] = queryKey
  const _valid = assertTokenValidity({ chainId, tokenAddress })
  const { api } = useStore.getState()
  return await api!.getUsdRate(_valid.tokenAddress as string)
}
