import { QueryFunction } from '@tanstack/react-query'
import { logQuery } from '@/shared/lib/logging'
import { assertChainValidity } from '../lib/validation'
import useStore from '@/store/useStore'
import { ChainQueryKeyType } from '../model'

export const queryOneWayMarketNames: QueryFunction<
  string[],
  ChainQueryKeyType<'markets'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , ] = queryKey
  assertChainValidity({ chainId })

  const {api} = useStore.getState()
  return api!.oneWayfactory.getMarketList()
}
