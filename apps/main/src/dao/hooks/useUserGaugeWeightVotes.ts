import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import type { ChainId } from '@/dao/types/dao.types'

export const useUserGaugeWeightVotes = ({ chainId, userAddress }: { chainId: ChainId; userAddress: string }) => {
  const { data: userGaugeWeightVotes, ...rest } = useUserGaugeWeightVotesQuery({ chainId, userAddress })

  return {
    userGaugeWeightVotes: userGaugeWeightVotes,
    ...rest,
  }
}
