import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { useEstimateGasAddRewardToken } from '@/dex/entities/gauge'
import { useAddRewardTokenFormContext } from '@/dex/features/add-gauge-reward-token/lib'
import { ChainId } from '@/dex/types/main.types'

export const EstimatedGasInfo = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
    watchValue,
    formState: { isValid },
  } = useAddRewardTokenFormContext()

  const rewardTokenId = watchValue('rewardTokenId')
  const distributorId = watchValue('distributorId')
  const { data: estimatedGas, isFetching: isFetchingGasEstimate } = useEstimateGasAddRewardToken(
    {
      chainId,
      poolId,
      rewardTokenId,
      distributorId,
    },
    isValid,
  )

  return (
    <DetailInfoEstGas
      chainId={chainId}
      estimatedGas={estimatedGas ?? null}
      loading={isFetchingGasEstimate && isValid}
    />
  )
}
