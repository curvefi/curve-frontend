import { InputDebounced } from '@ui/InputComp'
import { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { TIME_FRAMES } from '@/dex/constants'
import type { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { EpochInputWrapper, EpochLabel, StyledInputProvider } from '@/dex/features/deposit-gauge-reward/ui'
import { useDepositRewardApproveIsMutating, useDepositRewardIsMutating } from '@/dex/entities/gauge'
import { FlexContainer } from '@ui/styled-containers'
import { ChainId } from '@/dex/types/main.types'

export const EpochInput: React.FC<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const { setValue, formState, watch } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')
  const epoch = watch('epoch')

  const onEpochChange = useCallback(
    (epoch: string) => setValue('epoch', parseInt(epoch) * TIME_FRAMES.WEEK, { shouldValidate: true }),
    [setValue],
  )

  const isPendingDepositRewardApprove = useDepositRewardApproveIsMutating({ chainId, poolId, rewardTokenId, amount })
  const isPendingDepositReward = useDepositRewardIsMutating({ chainId, poolId, rewardTokenId, amount, epoch })

  const isDisabled = isPendingDepositReward || isPendingDepositRewardApprove

  return (
    <FlexContainer>
      <EpochLabel htmlFor="deposit-epoch">Distribution duration (in weeks)</EpochLabel>
      <EpochInputWrapper>
        <StyledInputProvider
          id="deposit-epoch"
          inputVariant={formState.errors.epoch ? 'error' : undefined}
          disabled={isDisabled}
        >
          <InputDebounced
            id="deposit-epoch"
            type="number"
            testId="deposit-epoch"
            value={String((epoch ?? 0) / TIME_FRAMES.WEEK)}
            onChange={onEpochChange}
          />
        </StyledInputProvider>
      </EpochInputWrapper>
    </FlexContainer>
  )
}
