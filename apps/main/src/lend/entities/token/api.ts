import { TokenQuery } from '@/lend/entities/token/index'
import type { Api } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'

export const queryTokenUsdRate = async ({ tokenAddress }: TokenQuery): Promise<number> => {
  const api = requireLib<Api>()
  return await api.getUsdRate(tokenAddress)
}
