import { ChainQuery } from '@/shared/model/query'
import useStore from '@/store/useStore'

export const queryOneWayMarketNames = async ({}: ChainQuery): Promise<string[]> => {
  const {api} = useStore.getState()
  return api!.oneWayfactory.getMarketList()
}
