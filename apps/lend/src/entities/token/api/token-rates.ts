import { QueryFunction } from '@tanstack/react-query'
import { logQuery } from '@/shared/lib/logging'
import { assertTokenValidity } from '@/entities/token/lib/validation'
import useStore from '@/store/useStore'
import { TokenQueryKeyType } from '@/entities/token'

export const queryTokenUsdRate: QueryFunction<number, TokenQueryKeyType<'usdRate'>> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , tokenAddress] = queryKey
  const _valid = assertTokenValidity({ chainId, tokenAddress })
  const { api } = useStore.getState()
  return await api!.getUsdRate(_valid.tokenAddress)
}
