import { useAddRewardTokenIsMutating, useIsDepositRewardAvailable } from '@/dex/entities/gauge'
import { useAddRewardTokenFormContext } from '@/dex/features/add-gauge-reward-token/lib'
import { ChainId } from '@/dex/types/main.types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'

export const FormActions = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const {
    formState: { isValid, isSubmitting },
    watchValue,
  } = useAddRewardTokenFormContext()
  const rewardTokenId = watchValue('rewardTokenId')
  const distributorId = watchValue('distributorId')

  const { data: isDepositRewardAvailable, isFetching: isFetchingIsDepositRewardAvailable } =
    useIsDepositRewardAvailable({ chainId, poolId })

  const isMutatingAddRewardToken = useAddRewardTokenIsMutating({ chainId, poolId, rewardTokenId, distributorId })

  const isDisabled = !isDepositRewardAvailable || !isValid
  const isLoading = isSubmitting || isFetchingIsDepositRewardAvailable || isMutatingAddRewardToken

  return (
    <FormButton
      disabled={isDisabled}
      loading={isLoading}
      label={t`Add Reward`}
      testId="add-reward-submit-button"
      connectWalletTestId="add-reward-connect-wallet-button"
    />
  )
}
