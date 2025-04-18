import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import type { ChainId } from '@/dao/types/dao.types'

export const useUserGaugeWeightVotes = ({ chainId, userAddress }: { chainId: ChainId; userAddress: string }) => {
  const {
    data: userGaugeWeightVotes,
    isLoading,
    isError,
    isSuccess,
  } = useUserGaugeWeightVotesQuery({ chainId, userAddress })

  return {
    userGaugeWeightVotes,
    isLoading,
    isError,
    isSuccess,
  }
}
