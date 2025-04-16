import { TokenQuery } from '@/lend/entities/token/index'
import { useApiStore } from '@ui-kit/shared/useApiStore'

export const queryTokenUsdRate = async ({ tokenAddress }: TokenQuery): Promise<number> => {
  const { llamalend } = useApiStore.getState()
  return await llamalend!.getUsdRate(tokenAddress)
}
