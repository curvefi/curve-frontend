import { TokenQuery } from '@/lend/entities/token/index'
import useStore from '@/lend/store/useStore'

export const queryTokenUsdRate = async ({ tokenAddress }: TokenQuery): Promise<number> => {
  const { api } = useStore.getState()
  return await api!.getUsdRate(tokenAddress)
}
