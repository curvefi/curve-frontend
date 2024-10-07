import { QueryFunction } from '@tanstack/react-query'
import { logQuery } from '@/shared/lib/logging'
import { extractTokenParams } from '@/entities/token/lib/validation'
import useStore from '@/store/useStore'
import { TokenQueryKeyType } from '@/entities/token'

export const queryTokenUsdRate: QueryFunction<number, TokenQueryKeyType<'usdRate'>> = async ({ queryKey }) => {
  logQuery(queryKey)
  const { tokenAddress } = extractTokenParams(queryKey)
  const { api } = useStore.getState()
  return await api!.getUsdRate(tokenAddress)
}
