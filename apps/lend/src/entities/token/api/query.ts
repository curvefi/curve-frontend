import { QueryFunction } from '@tanstack/react-query'
import { logQuery } from '@/shared/lib/logging'
import { assertTokenValidity } from '@/entities/token/lib/validation'
import { TokenQueryKeyType } from '@/entities/token'
import useStore from '@/store/useStore'

export const queryTokenUsdRate: QueryFunction<
  number,
  TokenQueryKeyType<'usdRate'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , givenAddress] = queryKey
  const { tokenAddress } = assertTokenValidity({ chainId, tokenAddress: givenAddress })

  const {api} = useStore.getState()
  return await api!.getUsdRate(tokenAddress)
}
