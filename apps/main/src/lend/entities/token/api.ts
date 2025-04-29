import { TokenQuery } from '@/lend/entities/token/index'
import { useApiStore } from '@ui-kit/shared/useApiStore'

export const queryTokenUsdRate = async ({ tokenAddress }: TokenQuery): Promise<number> => {
  const api = useApiStore.getState().lending
  return await api!.getUsdRate(tokenAddress)
}
