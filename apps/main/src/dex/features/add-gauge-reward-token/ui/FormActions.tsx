import { t } from '@lingui/macro'
import React from 'react'
import { useAddRewardTokenFormContext } from '@main/features/add-gauge-reward-token/lib'
import { StyledButton } from '@main/features/add-gauge-reward-token/ui/styled'
import { useAddRewardTokenIsMutating, useIsDepositRewardAvailable } from '@main/entities/gauge'
import { ChainId } from '@main/types/main.types'

export const FormActions: React.FC<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const {
    formState: { isValid, isSubmitting },
    watch,
  } = useAddRewardTokenFormContext()
  const rewardTokenId = watch('rewardTokenId')
  const distributorId = watch('distributorId')

  const { data: isDepositRewardAvailable, isFetching: isFetchingIsDepositRewardAvailable } =
    useIsDepositRewardAvailable({ chainId, poolId })

  const isMutatingAddRewardToken = useAddRewardTokenIsMutating({ chainId, poolId, rewardTokenId, distributorId })

  const isDisabled = !isDepositRewardAvailable || !isValid
  const isLoading = isSubmitting || isFetchingIsDepositRewardAvailable || isMutatingAddRewardToken

  return (
    <>
      <StyledButton disabled={isDisabled} loading={isLoading} variant="filled" size="medium">
        {t`Add Reward`}
      </StyledButton>
    </>
  )
}
