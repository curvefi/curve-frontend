import { QueryFunction } from '@tanstack/react-query'
import { logQuery } from '@/shared/lib/logging'
import { assertChainValidity } from '@/entities/chain'
import useStore from '@/store/useStore'
import { ChainQueryKeyType } from '@/entities/chain/model'

export const queryOneWayMarketNames: QueryFunction<
  string[],
  ChainQueryKeyType<'markets'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , ] = queryKey
  assertChainValidity({ chainId })

  const {api} = useStore.getState()
  await api!.oneWayfactory.fetchMarkets()
  return api!.oneWayfactory.getMarketList()
}
